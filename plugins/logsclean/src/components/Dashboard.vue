<template>
  <div class="dashboard-widget">
    <v-card :flat="!props.config?.attrs?.border" :loading="loading" class="fill-height d-flex flex-column">
      <v-card-item v-if="props.config?.attrs?.title || props.config?.attrs?.subtitle">
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-broom" class="mr-2" color="primary"></v-icon>
          {{ props.config?.attrs?.title || '日志清理概览' }}
        </v-card-title>
        <v-card-subtitle v-if="props.config?.attrs?.subtitle">{{ props.config.attrs.subtitle }}</v-card-subtitle>
      </v-card-item>

      <v-card-text class="flex-grow-1 pa-3">
        <div v-if="loading && !initialDataLoaded" class="text-center py-2">
          <v-progress-circular indeterminate color="primary" size="small"></v-progress-circular>
          <div class="text-caption mt-2">加载中...</div>
        </div>
        <div v-else-if="error" class="text-error text-caption d-flex align-center">
          <v-icon size="small" color="error" class="mr-2">mdi-alert-circle-outline</v-icon>
          {{ error || '数据加载失败' }}
        </div>
        <div v-else-if="initialDataLoaded && summaryData">
          <v-list density="compact" class="py-0" nav>
            <v-list-item class="px-2">
              <template v-slot:prepend>
                <v-icon size="small" :color="summaryData.enabled ? 'success' : 'grey'" class="mr-2">
                  mdi-power
                </v-icon>
              </template>
              <v-list-item-title class="text-caption">
                插件状态: 
                <span :class="summaryData.enabled ? 'text-success' : 'text-grey'">
                  {{ summaryData.enabled ? '已启用' : '已禁用' }}
                </span>
              </v-list-item-title>
            </v-list-item>

            <v-divider class="my-1"></v-divider>

            <v-list-item class="px-2">
              <template v-slot:prepend>
                <v-icon size="small" color="primary" class="mr-2">mdi-calendar-clock</v-icon>
              </template>
              <v-list-item-title class="text-caption">
                上次清理: {{ getLastRunTimeText() }}
              </v-list-item-title>
            </v-list-item>
            
            <v-list-item class="px-2">
              <template v-slot:prepend>
                <v-icon size="small" color="info" class="mr-2">mdi-counter</v-icon>
              </template>
              <v-list-item-title class="text-caption">
                最近清理: {{ getLastCleanedLinesText() }}
              </v-list-item-title>
            </v-list-item>
            
            <v-list-item class="px-2" v-if="summaryData.enabled">
              <template v-slot:prepend>
                <v-icon size="small" color="amber-darken-2" class="mr-2">mdi-timer-outline</v-icon>
              </template>
              <v-list-item-title class="text-caption">
                下次运行: {{ summaryData.next_run_time || '未知' }}
              </v-list-item-title>
            </v-list-item>
            
            <v-list-item class="px-2">
              <template v-slot:prepend>
                <v-icon size="small" color="deep-purple" class="mr-2">mdi-cog-outline</v-icon>
              </template>
              <v-list-item-title class="text-caption">
                保留行数: {{ summaryData.rows || 300 }} 行
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
        <div v-else class="text-caption text-disabled text-center py-3">
          <v-icon icon="mdi-information-outline" class="mb-2"></v-icon>
          <div>暂无数据，请检查插件配置</div>
        </div>
      </v-card-text>

      <v-divider v-if="props.allowRefresh"></v-divider>
      <v-card-actions v-if="props.allowRefresh" class="px-3 py-1">
        <span class="text-caption text-disabled">{{ lastRefreshedTimeDisplay }}</span>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" size="small" @click="fetchSummary" :loading="loading">
          <v-icon size="small">mdi-refresh</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
  api: { 
    type: Object,  // 修正类型为Object
    required: true,
  },
  config: { // Widget display config (title, border etc.)
    type: Object,
    default: () => ({ attrs: {} }),
  },
  allowRefresh: {
    type: Boolean,
    default: false,
  },
  refreshInterval: {
    type: Number,
    default: 0, // 0 means no auto-refresh
  },
});

const loading = ref(false);
const error = ref(null);
const initialDataLoaded = ref(false);
const summaryData = reactive({ 
    enabled: null,
    rows: 300,
    last_cleaned_lines: null, 
    last_run_time: null,
    next_run_time: null,
    cleaning_history: [], 
});
const lastRefreshedTimestamp = ref(null);

let refreshTimer = null;

const getPluginId = () => {
  return "LogsClean";  // 使用固定的插件ID
};

async function fetchSummary() {
  loading.value = true;
  error.value = null;
  
  try {
    // 获取插件ID
    const pluginId = getPluginId();
    
    // 使用props.api对象调用API
    const data = await props.api.get(`plugin/${pluginId}/status`);
    
    if (data) {
      // 更新数据
      summaryData.enabled = data.enabled;
      summaryData.rows = data.rows;
      summaryData.next_run_time = data.next_run_time;
      summaryData.cleaning_history = data.cleaning_history || [];
      
      // 从历史记录中提取最近的清理数据
      if (summaryData.cleaning_history.length > 0) {
        const lastRecord = summaryData.cleaning_history[0];
        summaryData.last_cleaned_lines = lastRecord.total_lines_cleaned;
        summaryData.last_run_time = lastRecord.timestamp;
      } else {
        summaryData.last_cleaned_lines = null;
        summaryData.last_run_time = null;
      }
      
      initialDataLoaded.value = true;
      lastRefreshedTimestamp.value = Date.now();
    } else {
      throw new Error('仪表盘数据响应无效');
    }
  } catch (err) {
    console.error('获取仪表盘数据失败:', err);
    error.value = err.message || '获取仪表盘数据失败';
  } finally {
    loading.value = false;
  }
}

const lastRefreshedTimeDisplay = computed(() => {
  if (!lastRefreshedTimestamp.value) return '';
  return `上次更新: ${new Date(lastRefreshedTimestamp.value).toLocaleTimeString()}`;
});

const getLastCleanedLinesText = () => {
    if (summaryData.last_cleaned_lines === null || summaryData.last_cleaned_lines === undefined) {
      return '无数据';
    }
    return `${summaryData.last_cleaned_lines} 行`;
};

const getLastRunTimeText = () => {
    return summaryData.last_run_time || '无数据';
};

onMounted(() => {
  fetchSummary();
  
  // 设置自动刷新
  if (props.allowRefresh && props.refreshInterval > 0) {
    refreshTimer = setInterval(fetchSummary, props.refreshInterval * 1000);
  }
});

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
});
</script>

<style scoped>
.dashboard-widget {
  height: 100%;
  width: 100%;
}
.v-card-item {
  padding-bottom: 8px;
}
.v-list-item {
  min-height: 28px;
}
</style>
