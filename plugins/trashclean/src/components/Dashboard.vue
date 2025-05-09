<template>
  <v-card class="fill-height">
    <v-card-title v-if="config?.attrs?.title">{{ config.attrs.title }}</v-card-title>
    <v-card-subtitle v-if="config?.attrs?.subtitle">{{ config.attrs.subtitle }}</v-card-subtitle>
    <v-card-text>
      <div class="d-flex align-center justify-center">
        <span class="text-h6">垃圾文件清理仪表盘</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { defineComponent, ref, reactive, onMounted, onUnmounted } from 'vue';

export default defineComponent({
  name: 'Dashboard',
  
  props: {
    api: {
      type: Object,
      required: true
    },
    config: {
      type: Object,
      default: () => ({ attrs: {} })
    },
    allowRefresh: {
      type: Boolean,
      default: false
    },
    refreshInterval: {
      type: Number,
      default: 0
    }
  },
  
  setup(props) {
    // 状态数据
    const loading = ref(false);
    const error = ref(null);
    const data = reactive({
      status: null
    });
    
    // 获取数据
    const fetchData = async () => {
      try {
        loading.value = true;
        const result = await props.api.get('plugin/TrashClean/status');
        data.status = result;
      } catch (err) {
        error.value = err.message || '获取数据失败';
        console.error('Dashboard获取数据失败:', err);
      } finally {
        loading.value = false;
      }
    };
    
    // 刷新定时器
    let refreshTimer = null;
    
    // 挂载时获取数据
    onMounted(() => {
      fetchData();
      
      // 设置自动刷新
      if (props.allowRefresh && props.refreshInterval > 0) {
        refreshTimer = setInterval(fetchData, props.refreshInterval * 1000);
      }
    });
    
    // 组件卸载时清除定时器
    onUnmounted(() => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    });
    
    return {
      loading,
      error,
      data
    };
  }
});
</script>

<style scoped>
.fill-height {
  height: 100%;
}
</style> 