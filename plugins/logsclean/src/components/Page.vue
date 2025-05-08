<template>
  <div class="plugin-page">
    <v-card flat class="rounded border">
      <!-- 标题区域 -->
      <v-card-title class="text-subtitle-1 d-flex align-center px-3 py-2 bg-primary-lighten-5">
        <v-icon icon="mdi-broom" class="mr-2" color="primary" size="small" />
        <span>日志清理</span>
      </v-card-title>
      
      <!-- 通知区域 -->
      <v-card-text class="px-3 py-2">
        <v-alert v-if="error" type="error" density="compact" class="mb-2 text-caption" variant="tonal" closable>{{ error }}</v-alert>
        <v-alert v-if="actionMessage" :type="actionMessageType" density="compact" class="mb-2 text-caption" variant="tonal" closable>{{ actionMessage }}</v-alert>
        
        <v-skeleton-loader v-if="loading && !initialDataLoaded" type="article, actions"></v-skeleton-loader>

        <div v-if="initialDataLoaded" class="my-1">
          <!-- 状态卡片 和 清理历史 -->
          <v-row>
            <v-col cols="12" md="6">
              <!-- 当前状态 -->
              <v-card flat class="rounded mb-3 border config-card">
                <v-card-title class="text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5">
                  <v-icon icon="mdi-information" class="mr-2" color="primary" size="small" />
                  <span>当前状态</span>
                </v-card-title>
                <v-card-text class="pa-0">
                  <v-list class="bg-transparent pa-0">
                    <v-list-item class="px-3 py-1">
                      <template v-slot:prepend>
                        <v-icon :color="statusData.enabled ? 'success' : 'grey'" icon="mdi-power" size="small" />
                      </template>
                      <v-list-item-title class="text-caption">插件状态</v-list-item-title>
                      <template v-slot:append>
                        <v-chip
                          :color="statusData.enabled ? 'success' : 'grey'"
                          size="x-small"
                          variant="tonal"
                        >
                          {{ statusData.enabled ? '已启用' : '已禁用' }}
                        </v-chip>
                      </template>
                    </v-list-item>
                    <v-divider class="my-1"></v-divider>
                    <v-list-item class="px-3 py-1">
                      <template v-slot:prepend>
                        <v-icon icon="mdi-code-braces" color="primary" size="small" />
                      </template>
                      <v-list-item-title class="text-caption">CRON表达式</v-list-item-title>
                      <template v-slot:append>
                        <code class="text-caption px-2 py-1 rounded" style="background-color: rgba(0,0,0,0.05)">{{ statusData.cron || '未设置' }}</code>
                      </template>
                    </v-list-item>
                    <v-divider class="my-1"></v-divider>
                    <v-list-item class="px-3 py-1">
                      <template v-slot:prepend>
                        <v-icon icon="mdi-clock-time-five" color="amber-darken-2" size="small" />
                      </template>
                      <v-list-item-title class="text-caption">下次运行</v-list-item-title>
                      <template v-slot:append>
                        <span class="text-caption">{{ statusData.next_run_time || '未知' }}</span>
                      </template>
                    </v-list-item>
                    <v-divider class="my-1"></v-divider>
                    <v-list-item class="px-3 py-1">
                      <template v-slot:prepend>
                        <v-icon icon="mdi-counter" color="teal" size="small" />
                      </template>
                      <v-list-item-title class="text-caption">保留日志行数</v-list-item-title>
                      <template v-slot:append>
                        <span class="text-caption">{{ statusData.rows || 300 }} 行</span>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="6">
              <!-- 清理历史 -->
              <v-card flat class="rounded mb-3 border config-card">
                <v-card-title class="text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5">
                  <v-icon icon="mdi-history" class="mr-2" color="primary" size="small" />
                  <span>清理历史</span>
                </v-card-title>
                <v-card-text class="px-3 py-2">
                  <div v-if="!statusData.cleaning_history?.length" class="text-center text-grey py-1">
                    <v-icon icon="mdi-information-outline" size="small" class="mb-1" />
                    <div class="text-caption">暂无清理历史记录</div>
                  </div>
                  <v-timeline v-else density="compact" align="start" truncate-line="both" class="mt-0">
                    <v-timeline-item 
                      v-for="(item, index) in statusData.cleaning_history.slice(0, 3)" 
                      :key="index"
                      :dot-color="getHistoryColor(index)"
                      size="x-small"
                    >
                      <template v-slot:icon>
                        <v-icon size="x-small">mdi-broom</v-icon>
                      </template>
                      <div class="d-flex justify-space-between align-center mb-1">
                        <span class="text-caption text-grey-darken-2">{{ item.timestamp }}</span>
                        <v-chip size="x-small" :color="getHistoryColor(index)" variant="flat">
                          #{{ index + 1 }}
                        </v-chip>
                      </div>
                      <div class="text-caption">
                        清理 <strong>{{ item.total_lines_cleaned }}</strong> 行 
                        ({{ item.total_plugins_processed }} 个插件)
                      </div>
                    </v-timeline-item>
                    <v-timeline-item v-if="statusData.cleaning_history.length > 3" dot-color="primary" size="x-small">
                      <template v-slot:icon>
                        <v-icon size="x-small">mdi-dots-horizontal</v-icon>
                      </template>
                      <div class="text-caption d-flex align-center">
                        <span class="text-grey">还有 {{ statusData.cleaning_history.length - 3 }} 条历史记录</span>
                        <v-btn 
                          variant="text" 
                          density="comfortable" 
                          size="x-small" 
                          color="primary"
                          class="ml-2"
                          @click="showHistoryDialog = true"
                        >
                          查看更多
                        </v-btn>
                      </div>
                    </v-timeline-item>
                  </v-timeline>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- 上次运行详情 -->
          <v-card flat class="rounded mb-3 border config-card">
            <v-card-title class="text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5">
              <v-icon icon="mdi-file-document" class="mr-2" color="primary" size="small" />
              <span>上次清理详情</span>
              <v-chip class="ml-1" size="x-small" color="info" variant="flat">{{ statusData.last_run_results?.length || 0 }} 个插件</v-chip>
            </v-card-title>
            <v-card-text v-if="!statusData.last_run_results?.length" class="text-center text-grey pa-2">
              <v-icon icon="mdi-information-outline" size="small" class="mb-1" />
              <div class="text-caption">暂无上次运行数据</div>
            </v-card-text>
            <v-card-text v-else class="pa-0">
              <v-table density="compact" hover class="text-caption">
                <thead>
                  <tr>
                    <th class="text-caption">插件名称</th>
                    <th class="text-caption text-center">原行数</th>
                    <th class="text-caption text-center">保留行数</th>
                    <th class="text-caption text-center">清理行数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in statusData.last_run_results" :key="index">
                    <td>
                      <div class="d-flex align-center">
                        <v-avatar size="18" class="mr-1" :color="getPluginColor(index)">
                          <span class="text-white text-caption" style="font-size: 10px">{{ getPluginInitial(getPluginDisplayName(item.plugin_id)) }}</span>
                        </v-avatar>
                        {{ getPluginDisplayName(item.plugin_id) }}
                      </div>
                    </td>
                    <td class="text-center">{{ item.original_lines }}</td>
                    <td class="text-center">{{ item.kept_lines }}</td>
                    <td class="text-center">
                      <v-chip size="x-small" color="success" variant="flat">
                        {{ item.cleaned_lines }}
                      </v-chip>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>

          <!-- 插件日志状态 -->
          <v-card flat class="rounded mb-3 border config-card">
            <v-card-title class="text-caption d-flex align-center justify-space-between px-3 py-2 bg-primary-lighten-5 flex-wrap">
              <div class="d-flex align-center">
                <v-icon icon="mdi-view-list" class="mr-2" color="primary" size="small" />
                <span>插件日志状态</span>
              </div>
              <div class="d-flex align-center">
                <v-text-field
                  v-model="pluginSearch"
                  density="compact"
                  hide-details
                  placeholder="搜索插件..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  class="search-field my-1"
                  bg-color="white"
                  style="font-size: 12px; min-width: 140px;"
                ></v-text-field>
                <v-btn 
                  variant="text" 
                  color="primary" 
                  size="x-small"
                  icon="mdi-refresh"
                  class="ml-1"
                  :loading="refreshingPluginLogs"
                  @click="loadPluginLogsSizes"
                >
                  <v-tooltip activator="parent" location="top">刷新插件状态</v-tooltip>
                </v-btn>
              </div>
            </v-card-title>
            <v-card-text class="pa-0">
              <div v-if="refreshingPluginLogs" class="d-flex justify-center align-center pa-2">
                <v-progress-circular indeterminate color="primary" size="20"></v-progress-circular>
                <span class="text-caption ml-2">加载插件日志信息...</span>
              </div>
              <div v-else-if="!installedPluginLogs.length" class="text-center text-grey py-2">
                <v-icon icon="mdi-information-outline" size="small" class="mb-1" />
                <div class="text-caption">未找到已安装插件的日志</div>
              </div>
              <div v-else class="plugin-list-container">
                <v-table density="compact" hover class="text-body-2">
                  <thead>
                    <tr>
                      <th class="text-body-2 font-weight-bold">插件名称</th>
                      <th class="text-body-2 font-weight-bold text-center">日志大小</th>
                      <th class="text-body-2 font-weight-bold text-center">行数</th>
                      <th class="text-body-2 font-weight-bold text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(plugin, index) in filteredPluginLogs" :key="index">
                      <td>
                        <div class="d-flex align-center">
                          <div class="plugin-avatar mr-2" :class="isSpecialLog(plugin.id) ? 'special-log' : `color-${index % 10}`">
                            <span>{{ getPluginInitial(plugin.name) }}</span>
                          </div>
                          <span :class="{ 'text-grey': isSpecialLog(plugin.id) }" class="plugin-name">
                            {{ plugin.name }} 
                            <v-chip v-if="isSpecialLog(plugin.id)" size="small" color="grey-lighten-2" class="ml-1">系统日志</v-chip>
                          </span>
                        </div>
                      </td>
                      <td class="text-center">
                        <v-chip size="x-small" :color="getPluginSizeColor(plugin.size)" variant="flat">
                          {{ formatFileSize(plugin.size) }}
                        </v-chip>
                      </td>
                      <td class="text-center">{{ plugin.lines_count }}</td>
                      <td class="text-right">
                        <v-btn 
                          density="comfortable" 
                          icon 
                          variant="text" 
                          color="error"
                          size="x-small"
                          :disabled="!statusData.enabled || cleaningSpecificPlugin === plugin.id"
                          :loading="cleaningSpecificPlugin === plugin.id"
                          @click="cleanSpecificPlugin(plugin.id, plugin.name)"
                        >
                          <v-icon icon="mdi-broom" size="small"></v-icon>
                          <v-tooltip activator="parent" location="top">清理此日志</v-tooltip>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
      
      <v-divider></v-divider>
      
      <!-- 操作按钮区域 -->
      <v-card-actions class="px-2 py-1">
        <v-btn color="primary" @click="emit('switch')" prepend-icon="mdi-cog" variant="text" size="small">配置</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="info" @click="fetchStatusData" :loading="loading" prepend-icon="mdi-refresh" variant="text" size="small">刷新状态</v-btn>
        <v-btn 
          color="success" 
          @click="runCleanNow" 
          :loading="cleaningNow" 
          prepend-icon="mdi-broom"
          :disabled="!statusData.enabled"
          variant="text"
          size="small"
        >
          立即清理全部
        </v-btn>
        <v-btn color="grey" @click="emit('close')" prepend-icon="mdi-close" variant="text" size="small">关闭</v-btn>
      </v-card-actions>
    </v-card>

    <!-- 添加历史记录对话框 -->
    <v-dialog v-model="showHistoryDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-subtitle-1 d-flex align-center px-4 py-3 bg-primary-lighten-5">
          <v-icon icon="mdi-history" class="mr-2" color="primary" />
          <span>清理历史记录</span>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-timeline v-if="statusData.cleaning_history?.length" density="compact" align="start">
            <v-timeline-item 
              v-for="(item, index) in statusData.cleaning_history" 
              :key="index"
              :dot-color="getHistoryColor(index)"
              size="small"
            >
              <template v-slot:icon>
                <v-icon size="x-small">mdi-broom</v-icon>
              </template>
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-caption font-weight-medium">{{ item.timestamp }}</span>
                <v-chip size="x-small" :color="getHistoryColor(index)" variant="flat">
                  #{{ index + 1 }}
                </v-chip>
              </div>
              <div class="text-body-2">
                清理 <strong>{{ item.total_lines_cleaned }}</strong> 行 
                ({{ item.total_plugins_processed }} 个插件)
              </div>
            </v-timeline-item>
          </v-timeline>
          <div v-else class="d-flex align-center justify-center py-4">
            <v-icon icon="mdi-information-outline" color="grey" class="mr-2" />
            <span class="text-grey">暂无清理历史记录</span>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 py-3">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="primary" @click="showHistoryDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';

const props = defineProps({
  api: {
    type: [Object, Function],
    required: true,
  }
});

const emit = defineEmits(['switch', 'close']);

const loading = ref(false);
const cleaningNow = ref(false);
const cleaningSpecificPlugin = ref(null);
const error = ref(null);
const actionMessage = ref(null);
const actionMessageType = ref('info');
const initialDataLoaded = ref(false);
const refreshingPluginLogs = ref(false);
const pluginLogsSizes = ref([]);
const pluginSearch = ref('');
const installedPlugins = ref([]);
const showHistoryDialog = ref(false);

// 中文名称映射缓存
const pluginNameMap = reactive({});

const statusData = reactive({
  enabled: false,
  cron: '',
  rows: 300,
  next_run_time: 'N/A',
  last_run_results: [],
  cleaning_history: [],
});

// 已安装的插件日志列表
const installedPluginLogs = computed(() => {
  // 获取已安装插件ID列表
  const installedIds = installedPlugins.value.map(p => p.toLowerCase());
  
  // 调试日志
  console.log('已安装插件数量:', installedIds.length, '已安装插件ID:', installedIds);
  console.log('日志列表总数量:', pluginLogsSizes.value.length);
  
  // 过滤出已安装插件的日志，宽松匹配 - 只要ID包含在插件ID中即可
  const result = pluginLogsSizes.value.filter(plugin => 
    plugin && plugin.id && (
      // 精确匹配插件ID
      installedIds.includes(plugin.id.toLowerCase()) ||
      // 通过判断日志ID是否是某个插件ID的一部分来匹配
      installedIds.some(id => plugin.id.toLowerCase().includes(id)) ||
      // 通过判断插件ID是否是某个日志ID的一部分来匹配
      installedIds.some(id => id.includes(plugin.id.toLowerCase()))
    )
  );
  
  console.log('过滤后安装的插件日志数量:', result.length);
  
  // 确保即使没有安装插件匹配，也返回所有日志文件
  if (result.length === 0 && pluginLogsSizes.value.length > 0) {
    console.log('未找到匹配的已安装插件日志，返回所有日志文件');
    return pluginLogsSizes.value;
  }
  
  return result;
});

// 过滤后的插件日志 - 基于搜索和已安装状态
const filteredPluginLogs = computed(() => {
  const baseList = installedPluginLogs.value;
  console.log('过滤前的日志数量:', baseList.length);
  
  if (!pluginSearch.value) {
    return baseList;
  }
  
  const searchTerm = pluginSearch.value.toLowerCase();
  const result = baseList.filter(plugin => 
    (plugin.name && plugin.name.toLowerCase().includes(searchTerm)) || 
    (plugin.id && plugin.id.toLowerCase().includes(searchTerm))
  );
  
  console.log('搜索过滤后的日志数量:', result.length, '搜索词:', searchTerm);
  return result;
});

const getPluginId = () => {
  return "LogsClean";
};

// 获取插件首字母或图标
function getPluginInitial(name) {
  if (!name) return '?';
  
  // 正则匹配中文字符
  const match = name.match(/[\u4e00-\u9fa5]/);
  if (match) {
    return match[0]; // 返回第一个中文字符
  }
  
  // 如果没有中文字符，返回第一个字母(大写)
  return name.charAt(0).toUpperCase();
}

// 获取插件显示名称
function getPluginDisplayName(pluginId) {
  if (!pluginId) return '未知插件';
  
  // 统一ID格式为小写处理
  const normalizedId = pluginId.toLowerCase();
  
  // 从缓存获取名称 - 检查原始ID和小写ID
  const cachedName = pluginNameMap[pluginId] || pluginNameMap[normalizedId];
  if (cachedName) return cachedName;
  
  // 尝试从插件列表中查找 - 使用不区分大小写的比较
  const plugin = pluginLogsSizes.value.find(p => p.id && p.id.toLowerCase() === normalizedId);
  if (plugin && plugin.name) {
    // 更新缓存 - 同时存储原始ID和小写ID
    pluginNameMap[pluginId] = plugin.name;
    pluginNameMap[normalizedId] = plugin.name;
    return plugin.name;
  }
  
  // 再尝试从已安装插件列表查找
  const matchingPlugin = installedPlugins.value.find(id => id && id.toLowerCase() === normalizedId);
  if (matchingPlugin) {
    const displayName = pluginNameMap[matchingPlugin] || matchingPlugin;
    // 更新缓存
    pluginNameMap[pluginId] = displayName;
    pluginNameMap[normalizedId] = displayName;
    return displayName;
  }
  
  // 如果未找到，返回原ID并进行首字母大写处理
  const formattedId = pluginId.charAt(0).toUpperCase() + pluginId.slice(1);
  return formattedId;
}

// 获取插件卡片颜色
function getPluginColor(index) {
  // 确保索引是数字
  const colorIndex = typeof index === 'number' ? index : 0;
  
  // 更丰富的颜色数组，避免透明色
  const colors = [
    'primary', 'success', 'indigo', 'deep-purple', 'teal', 
    'cyan', 'amber-darken-2', 'blue', 'error', 'deep-orange',
    'purple', 'green', 'pink', 'brown', 'blue-grey', 'orange'
  ];
  
  // 返回对应颜色，如果越界则循环使用
  return colors[colorIndex % colors.length] || 'primary';
}

// 获取插件大小颜色
function getPluginSizeColor(size) {
  if (size < 10240) return 'success'; // 小于10KB
  if (size < 102400) return 'info';   // 小于100KB
  if (size < 512000) return 'warning'; // 小于500KB
  return 'error';                      // 大于500KB
}

// 获取历史记录颜色
function getHistoryColor(index) {
  const colors = ['success', 'info', 'primary'];
  return colors[index] || 'grey';
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + sizes[i];
}

// 获取所有已安装的插件ID列表
async function loadInstalledPlugins() {
  try {
    const pluginId = getPluginId();
    const data = await props.api.get(`plugin/${pluginId}/installed_plugins`);
    
    if (Array.isArray(data)) {
      // 获取已安装插件ID(所有都转为小写)
      installedPlugins.value = data.map(plugin => plugin.value?.toLowerCase()).filter(Boolean);
      
      // 同时更新名称映射（title是中文名称）
      data.forEach(plugin => {
        if (plugin.value && plugin.title) {
          // 提取中文名（去掉版本号）
          const match = plugin.title.match(/^(.*?)(?:\sv|$)/);
          const chineseName = match ? match[1].trim() : plugin.title;
          
          // 同时以原始ID和小写ID为键存储中文名
          pluginNameMap[plugin.value] = chineseName;
          pluginNameMap[plugin.value.toLowerCase()] = chineseName;
        }
      });
      
      console.log('已加载插件名称映射:', Object.keys(pluginNameMap).length);
    }
  } catch (err) {
    console.error('获取已安装插件列表失败:', err);
    error.value = '获取插件列表失败';
    setTimeout(() => { error.value = null; }, 3000);
  }
}

async function fetchStatusData() {
  loading.value = true;
  error.value = null;
  actionMessage.value = null; 

  const pluginId = getPluginId();
  if (!pluginId) {
    loading.value = false;
    return;
  }

  try {
    // 正确的API路径，不含/api/v1/前缀
    const data = await props.api.get(`plugin/${pluginId}/status`);
    
    if (data) {
      Object.assign(statusData, data);
      initialDataLoaded.value = true;
      
      // 加载插件信息
      if (initialDataLoaded.value) {
        await loadInstalledPlugins();
        await loadPluginLogsSizes();
      }
    } else {
      throw new Error('获取状态响应无效或为空');
    }
  } catch (err) {
    console.error('获取插件状态失败:', err);
    error.value = err.message || '获取插件状态失败，请检查网络或API';
  } finally {
    loading.value = false;
  }
}

async function runCleanNow() {
  cleaningNow.value = true;
  error.value = null;
  actionMessage.value = null;

  const pluginId = getPluginId();
  if (!pluginId) {
    cleaningNow.value = false;
    return;
  }

  try {
    // 正确的API路径，不含/api/v1/前缀
    const data = await props.api.post(`plugin/${pluginId}/clean`);
    
    if (data) {
      if (data.error) {
        throw new Error(data.message || '执行清理时发生错误');
      }
      actionMessage.value = data.message || '清理任务已完成';
      actionMessageType.value = 'success';
      
      // 清理完成后刷新状态
      setTimeout(() => fetchStatusData(), 1000);
    } else {
      throw new Error('清理响应无效或为空');
    }
  } catch (err) {
    console.error('执行清理任务失败:', err);
    error.value = err.message || '执行清理任务失败';
    actionMessageType.value = 'error';
  } finally {
    cleaningNow.value = false;
    setTimeout(() => { actionMessage.value = null; }, 7000);
  }
}

// 加载所有插件日志的大小和行数
async function loadPluginLogsSizes() {
  refreshingPluginLogs.value = true;

  try {
    const pluginId = getPluginId();
    const data = await props.api.get(`plugin/${pluginId}/logs_stats`);
    
    if (Array.isArray(data)) {
      pluginLogsSizes.value = data;
      
      // 更新名称映射，记录调试信息
      console.log('加载到插件日志信息:', data.length, '个');
      
      let updatedMappings = 0;
      data.forEach(plugin => {
        if (plugin.id && plugin.name) {
          // 同时存储原始ID和小写ID版本
          pluginNameMap[plugin.id] = plugin.name;
          pluginNameMap[plugin.id.toLowerCase()] = plugin.name;
          updatedMappings++;
        }
      });
      
      console.log('更新了名称映射:', updatedMappings, '个');
      
      // 尝试更新已有结果的插件名称
      if (statusData.last_run_results && statusData.last_run_results.length > 0) {
        let updatedResults = 0;
        statusData.last_run_results.forEach(result => {
          if (!result.plugin_id) return;
          
          // 尝试根据ID查找插件（不区分大小写）
          const matchingPlugin = data.find(p => 
            p.id && p.id.toLowerCase() === result.plugin_id.toLowerCase()
          );
          
          if (matchingPlugin && matchingPlugin.name) {
            // 更新映射
            pluginNameMap[result.plugin_id] = matchingPlugin.name;
            pluginNameMap[result.plugin_id.toLowerCase()] = matchingPlugin.name;
            updatedResults++;
          }
        });
        
        console.log('更新了结果项插件名称:', updatedResults, '个');
      }
    } else {
      throw new Error('获取插件日志统计信息失败');
    }
  } catch (err) {
    console.error('获取插件日志统计信息失败:', err);
    error.value = '获取插件日志统计信息失败';
    setTimeout(() => { error.value = null; }, 5000);
  } finally {
    refreshingPluginLogs.value = false;
  }
}

// 清理特定插件的日志
async function cleanSpecificPlugin(pluginId, pluginName) {
  if (!pluginId || !statusData.enabled) return;
  
  cleaningSpecificPlugin.value = pluginId;
  error.value = null;
  actionMessage.value = null;

  try {
    const mainPluginId = getPluginId();
    const data = await props.api.post(`plugin/${mainPluginId}/clean_plugin`, { plugin_id: pluginId });
    
    if (data) {
      if (data.error) {
        throw new Error(data.message || '执行清理时发生错误');
      }
      actionMessage.value = `已成功清理 "${pluginName || pluginId}" 的日志`;
      actionMessageType.value = 'success';
      
      // 清理完成后刷新插件日志状态
      setTimeout(() => {
        loadPluginLogsSizes();
        fetchStatusData();
      }, 1000);
    } else {
      throw new Error('清理响应无效或为空');
    }
  } catch (err) {
    console.error(`清理插件 ${pluginId} 日志失败:`, err);
    error.value = `清理插件 "${pluginName || pluginId}" 日志失败: ${err.message || '未知错误'}`;
    actionMessageType.value = 'error';
  } finally {
    cleaningSpecificPlugin.value = null;
    setTimeout(() => { actionMessage.value = null; }, 5000);
  }
}

// 判断是否是特殊日志文件
function isSpecialLog(pluginId) {
  if (!pluginId) return false;
  
  // 系统日志标记
  const specialLogs = ['plugin', 'system', 'main', 'error'];
  const normalizedId = pluginId.toLowerCase();
  
  // 检查是否是特殊日志
  return specialLogs.includes(normalizedId) || 
    // 检查插件ID是否存在于已安装插件中
    !installedPlugins.value.some(id => 
      id && normalizedId === id.toLowerCase() || 
      normalizedId.includes(id.toLowerCase()) ||
      id.toLowerCase().includes(normalizedId)
    );
}

// Fetch initial data when component is mounted
onMounted(() => {
  fetchStatusData();
});
</script>

<style scoped>
.plugin-page {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0.5rem;
}

.max-width-120 {
  max-width: 120px;
}

.bg-primary-lighten-5 {
  background-color: rgba(var(--v-theme-primary), 0.07);
}

.border {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.search-field {
  max-width: 140px;
}

.plugin-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: white;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.plugin-name {
  font-size: 14px;
}

.text-body-2 {
  font-size: 14px !important;
}

.plugin-list-container {
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.plugin-list-container::-webkit-scrollbar {
  width: 6px;
}

.plugin-list-container::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-surface), 0.6);
}

.plugin-list-container::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-primary), 0.3);
  border-radius: 6px;
}

.special-log {
  background-color: rgba(128, 128, 128, 0.9);
}

.color-0 {
  background-color: rgba(var(--v-theme-primary), 1);
}

.color-1 {
  background-color: rgba(var(--v-theme-success), 1);
}

.color-2 {
  background-color: rgba(var(--v-theme-indigo), 1);
}

.color-3 {
  background-color: rgba(var(--v-theme-deep-purple), 1);
}

.color-4 {
  background-color: rgba(var(--v-theme-teal), 1);
}

.color-5 {
  background-color: rgba(var(--v-theme-cyan), 1);
}

.color-6 {
  background-color: rgba(var(--v-theme-amber-darken-2), 1);
}

.color-7 {
  background-color: rgba(var(--v-theme-blue), 1);
}

.color-8 {
  background-color: rgba(var(--v-theme-error), 1);
}

.color-9 {
  background-color: rgba(var(--v-theme-deep-orange), 1);
}

.config-card {
  background-image: linear-gradient(to right, rgba(var(--v-theme-surface), 0.98), rgba(var(--v-theme-surface), 0.95)), 
                    repeating-linear-gradient(45deg, rgba(var(--v-theme-primary), 0.03), rgba(var(--v-theme-primary), 0.03) 10px, transparent 10px, transparent 20px);
  background-attachment: fixed;
  box-shadow: 0 1px 2px rgba(var(--v-border-color), 0.05) !important;
  transition: all 0.3s ease;
}

.config-card:hover {
  box-shadow: 0 3px 6px rgba(var(--v-border-color), 0.1) !important;
}
</style>
