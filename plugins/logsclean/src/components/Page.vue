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
              <div class="result-list-container">
                <v-table density="compact" hover class="text-body-2">
                  <thead>
                    <tr>
                      <th class="text-body-2 font-weight-bold">插件名称</th>
                      <th class="text-body-2 font-weight-bold text-center">原行数</th>
                      <th class="text-body-2 font-weight-bold text-center">保留行数</th>
                      <th class="text-body-2 font-weight-bold text-center">清理行数</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in statusData.last_run_results" :key="index">
                      <td>
                        <div class="d-flex align-center">
                          <div class="plugin-avatar mr-2" :class="getPluginClass(item.plugin_id)">
                            <span>{{ getPluginInitial(getPluginDisplayName(item.plugin_id)) }}</span>
                          </div>
                          <span :class="{ 'text-grey': isSpecialLog(item.plugin_id) || isDeletedPluginLog(item.plugin_id) }" class="plugin-name">
                            {{ getPluginDisplayName(item.plugin_id) }}
                          </span>
                        </div>
                      </td>
                      <td class="text-center">{{ item.original_lines }}</td>
                      <td class="text-center">{{ item.kept_lines }}</td>
                      <td class="text-center">
                        <v-chip size="small" color="success" variant="flat">
                          {{ item.cleaned_lines }}
                        </v-chip>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
            </v-card-text>
          </v-card>

          <!-- 插件日志状态 -->
          <v-card flat class="rounded mb-3 border config-card">
            <v-card-title class="text-caption d-flex align-center justify-space-between px-3 py-2 bg-primary-lighten-5 flex-wrap">
              <div class="d-flex align-center">
                <v-icon icon="mdi-view-list" class="mr-2" color="primary" size="small" />
                <span>插件日志状态</span>
                <v-chip v-if="logStatistics.total > 0" size="x-small" color="info" variant="flat" class="ml-1">
                  {{ logStatistics.total }}个日志
                </v-chip>
              </div>
              <div class="d-flex align-center flex-wrap">
                <div class="mr-2 d-flex align-center">
                  <v-chip size="x-small" color="grey-lighten-2" class="mr-1">系统</v-chip>
                  <span class="text-caption">{{ logStatistics.system }}</span>
                  <v-divider vertical class="mx-1"></v-divider>
                  <v-chip size="x-small" color="primary-lighten-3" class="mr-1">已安装</v-chip>
                  <span class="text-caption">{{ logStatistics.installed }}</span>
                  <v-divider vertical class="mx-1"></v-divider>
                  <v-chip size="x-small" color="error-lighten-3" class="mr-1">已删除</v-chip>
                  <span class="text-caption">{{ logStatistics.deleted }}</span>
                  
                  <v-menu v-if="logStatistics.deleted > 0 || logStatistics.split > 0">
                    <template v-slot:activator="{ props }">
                      <v-btn v-bind="props" variant="text" color="error" density="comfortable" size="x-small" class="ml-2">
                        批量操作
                        <v-icon right size="small">mdi-chevron-down</v-icon>
                      </v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item v-if="logStatistics.deleted > 0" @click="showBatchDeleteConfirm('deleted')" prepend-icon="mdi-delete-sweep" title="清除所有已删除插件日志" />
                      <v-list-item v-if="logStatistics.split > 0" @click="showBatchDeleteConfirm('split')" prepend-icon="mdi-file-multiple" title="清除所有分割日志文件" />
                      <v-list-item v-if="logStatistics.deleted > 0 && logStatistics.split > 0" @click="showBatchDeleteConfirm('all')" prepend-icon="mdi-delete-alert" title="清除已删除插件和分割日志" />
                    </v-list>
                  </v-menu>
                </div>
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
                          <div class="plugin-avatar mr-2" :class="getPluginClass(plugin.id)">
                            <span>{{ getPluginInitial(plugin.name) }}</span>
                          </div>
                          <span :class="{ 'text-grey': isSpecialLog(plugin.id) || isDeletedPluginLog(plugin.id) }" class="plugin-name">
                            {{ plugin.name }} 
                            <v-chip v-if="isSpecialLog(plugin.id)" size="small" color="grey-lighten-2" class="ml-1">系统日志</v-chip>
                            <v-chip v-if="isDeletedPluginLog(plugin.id)" size="small" color="error-lighten-3" class="ml-1">已删除插件</v-chip>
                            <v-chip v-if="isSplitLogFile(plugin.id)" size="small" color="warning-lighten-3" class="ml-1">分割日志</v-chip>
                          </span>
                        </div>
                      </td>
                      <td class="text-center">
                        <v-chip size="small" :color="getPluginSizeColor(plugin.size)" variant="flat">
                          {{ formatFileSize(plugin.size) }}
                        </v-chip>
                      </td>
                      <td class="text-center">{{ plugin.lines_count }}</td>
                      <td class="text-right">
                        <div class="d-flex justify-end">
                          <v-btn 
                            density="comfortable" 
                            icon 
                            variant="text" 
                            color="error"
                            size="small"
                            :disabled="!statusData.enabled || cleaningSpecificPlugin === plugin.id"
                            :loading="cleaningSpecificPlugin === plugin.id"
                            @click="cleanSpecificPlugin(plugin.id, plugin.name)"
                            class="mr-1"
                          >
                            <v-icon icon="mdi-broom" size="small"></v-icon>
                            <v-tooltip activator="parent" location="top">清理此日志</v-tooltip>
                          </v-btn>
                          <v-btn 
                            density="comfortable" 
                            icon 
                            variant="text" 
                            color="grey-darken-1"
                            size="small"
                            :disabled="deletingLogFile === plugin.id"
                            :loading="deletingLogFile === plugin.id"
                            @click="deleteLogFile(plugin.id, plugin.name)"
                          >
                            <v-icon icon="mdi-delete" size="small"></v-icon>
                            <v-tooltip activator="parent" location="top">删除此日志</v-tooltip>
                          </v-btn>
                        </div>
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

    <!-- 添加删除日志文件的确认对话框 -->
    <v-dialog v-model="showDeleteConfirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-subtitle-1 d-flex align-center px-4 py-3 bg-error-lighten-5 text-error">
          <v-icon icon="mdi-alert" class="mr-2" color="error" />
          <span>确认删除</span>
        </v-card-title>
        <v-card-text class="pa-4">
          <p>确定要永久删除"{{ deletingLogName }}"的日志文件吗？此操作无法撤消。</p>
        </v-card-text>
        <v-card-actions class="px-4 py-3">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="grey" @click="showDeleteConfirmDialog = false">取消</v-btn>
          <v-btn variant="text" color="error" @click="confirmDeleteLogFile">确认删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 批量删除确认对话框 -->
    <v-dialog v-model="showBatchDeleteConfirmDialog" max-width="450">
      <v-card>
        <v-card-title class="text-subtitle-1 d-flex align-center px-4 py-3 bg-error-lighten-5 text-error">
          <v-icon icon="mdi-alert" class="mr-2" color="error" />
          <span>批量删除确认</span>
        </v-card-title>
        <v-card-text class="pa-4">
          <p>{{ batchDeleteConfirmMessage }}</p>
          <v-alert v-if="batchDeleteType" type="warning" density="compact" variant="tonal" class="mt-2">
            此操作无法撤销，请谨慎操作！
          </v-alert>
        </v-card-text>
        <v-card-actions class="px-4 py-3">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="grey" @click="cancelBatchDelete">取消</v-btn>
          <v-btn 
            variant="text" 
            color="error" 
            @click="confirmBatchDelete"
            :loading="batchDeleting"
            :disabled="batchDeleting"
          >
            确认删除
          </v-btn>
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

// 日志统计信息
const logStatistics = reactive({
  total: 0,
  system: 0,
  installed: 0,
  deleted: 0,
  split: 0
});

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

// 已安装的插件日志列表（不再过滤，而是显示全部）
const installedPluginLogs = computed(() => {
  // 记录调试信息
  console.log('已安装插件数量:', installedPlugins.value.length, 
              '已安装插件ID(原始大小写):', installedPlugins.value);
  console.log('日志列表总数量:', pluginLogsSizes.value.length);
  
  // 不再过滤，返回所有日志文件
  return pluginLogsSizes.value;
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
      // 获取已安装插件ID(保持原始大小写)
      installedPlugins.value = data
        .map(plugin => typeof plugin === 'object' && plugin.value ? plugin.value : 
                       typeof plugin === 'string' ? plugin : null)
        .filter(Boolean);
      
      // 同时更新名称映射（title是中文名称）
      data.forEach(plugin => {
        if (typeof plugin === 'object' && plugin.value && plugin.title) {
          // 提取中文名（去掉版本号）
          const match = plugin.title.match(/^(.*?)(?:\sv|$)/);
          const chineseName = match ? match[1].trim() : plugin.title;
          
          // 存储中文名（保持原始大小写的ID）
          pluginNameMap[plugin.value] = chineseName;
        }
      });
      
      console.log('已加载插件ID列表(原始大小写):', installedPlugins.value);
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
    // 修正API路径，确保正确的格式
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
      
      // 更新统计信息
      updateLogStatistics();
      
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
  
  // 检查是否是特殊日志（只检查系统日志列表）
  return specialLogs.includes(normalizedId);
}

// 判断是否是已删除插件的日志文件 - 改进识别逻辑
function isDeletedPluginLog(pluginId) {
  if (!pluginId) return false;
  
  // 如果是特殊系统日志，不是已删除插件
  if (isSpecialLog(pluginId)) return false;
  
  // 获取插件对象
  const plugin = pluginLogsSizes.value.find(p => p.id === pluginId);
  if (!plugin) return false;
  
  // 使用后端提供的原始ID
  let basePluginId = plugin.original_id || pluginId;
  
  // 检查是否不在已安装插件列表中
  if (!installedPlugins.value || installedPlugins.value.length === 0) {
    return false; // 如果没有安装插件数据，不做判断
  }
  
  // 支持大小写不敏感和部分匹配，避免误判
  const isInstalled = installedPlugins.value.some(installedId => {
    if (!installedId) return false;
    
    // 大小写不敏感的比较
    const normalizedBaseId = basePluginId.toLowerCase();
    const normalizedInstalledId = installedId.toLowerCase();
    
    // 精确匹配（优先考虑）
    if (normalizedBaseId === normalizedInstalledId) {
      return true;
    }
    
    // 部分匹配检查（次要考虑）
    return normalizedBaseId.includes(normalizedInstalledId) ||
           normalizedInstalledId.includes(normalizedBaseId);
  });
  
  // 不在已安装列表中，则认为是已删除的插件
  return !isInstalled;
}

// 判断是否是分割日志文件
function isSplitLogFile(pluginId) {
  if (!pluginId) return false;
  
  // 通过is_split字段判断，或通过文件名匹配模式判断
  const plugin = pluginLogsSizes.value.find(p => p.id === pluginId);
  if (plugin && plugin.is_split !== undefined) {
    return plugin.is_split;
  }
  
  // 兼容方式：通过文件名格式判断
  return Boolean(pluginId.match(/^.+?\.log\.\d+$/) || pluginId.match(/^.+?\.\d+$/));
}

// 获取分割日志的基础ID
function getBaseSplitLogId(pluginId) {
  const match = pluginId.match(/^(.+?)\.log\.\d+$/);
  return match ? match[1] : pluginId;
}

// 获取插件的CSS类名
function getPluginClass(pluginId) {
  if (!pluginId) return 'color-grey';
  
  if (isSpecialLog(pluginId)) {
    return 'special-log';
  }
  
  if (isDeletedPluginLog(pluginId)) {
    return 'deleted-log';
  }
  
  // 使用有限的几种颜色，确保可见
  const safeColors = ['color-primary', 'color-success', 'color-info', 'color-error', 'color-warning'];
  const hash = pluginId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return safeColors[hash % safeColors.length];
}

// 删除日志文件相关变量和函数
const deletingLogFile = ref(null);
const deletingLogName = ref('');
const showDeleteConfirmDialog = ref(false);

// 批量删除相关变量
const showBatchDeleteConfirmDialog = ref(false);
const batchDeleteType = ref(null); // 'deleted', 'split', 'all'
const batchDeleteConfirmMessage = ref('');
const batchDeleting = ref(false);

// 显示删除确认对话框
function deleteLogFile(pluginId, pluginName) {
  const plugin = pluginLogsSizes.value.find(p => p.id === pluginId);
  if (!plugin) {
    error.value = "找不到要删除的插件日志信息";
    setTimeout(() => { error.value = null; }, 3000);
    return;
  }
  
  // 保存完整的文件名信息
  const logFileName = plugin.file_name || `${pluginId}.log`;
  
  deletingLogFile.value = logFileName;  // 存储完整文件名
  deletingLogName.value = pluginName || pluginId;
  showDeleteConfirmDialog.value = true;
  
  console.log(`准备删除日志文件: ${logFileName}, 显示名称: ${deletingLogName.value}`);
}

// 确认删除日志文件
async function confirmDeleteLogFile() {
  try {
    const pluginId = getPluginId();
    
    if (!deletingLogFile.value) {
      throw new Error('未指定要删除的日志文件');
    }
    
    console.log(`发送删除请求: ${deletingLogFile.value}`);
    
    const data = await props.api.post(`plugin/${pluginId}/delete_log`, { 
      log_id: deletingLogFile.value 
    });
    
    if (data) {
      if (data.error) {
        throw new Error(data.message || '删除日志文件时发生错误');
      }
      
      actionMessage.value = `已成功删除 "${deletingLogName.value}" 的日志文件`;
      actionMessageType.value = 'success';
      
      // 刷新插件日志列表
      setTimeout(() => loadPluginLogsSizes(), 1000);
    } else {
      throw new Error('删除请求无响应');
    }
  } catch (err) {
    console.error(`删除日志文件失败:`, err);
    error.value = `删除 "${deletingLogName.value}" 日志文件失败: ${err.message || '未知错误'}`;
    actionMessageType.value = 'error';
  } finally {
    deletingLogFile.value = null;
    showDeleteConfirmDialog.value = false;
    setTimeout(() => { actionMessage.value = null; }, 5000);
  }
}

// 添加删除所有相关分割日志的函数
async function deleteSplitLogs(baseId) {
  try {
    const pluginId = getPluginId();
    
    // 构建请求参数
    const data = await props.api.post(`plugin/${pluginId}/delete_split_logs`, { 
      base_id: baseId 
    });
    
    if (data) {
      if (data.error) {
        throw new Error(data.message || '删除分割日志文件时发生错误');
      }
      
      actionMessage.value = `已成功删除 "${baseId}" 的所有分割日志文件`;
      actionMessageType.value = 'success';
      
      // 刷新插件日志列表
      setTimeout(() => loadPluginLogsSizes(), 1000);
    } else {
      throw new Error('删除请求无响应');
    }
  } catch (err) {
    console.error(`删除分割日志文件失败:`, err);
    error.value = `删除 "${baseId}" 的分割日志文件失败: ${err.message || '未知错误'}`;
    actionMessageType.value = 'error';
  } finally {
    setTimeout(() => { actionMessage.value = null; }, 5000);
  }
}

// 添加统计功能
function updateLogStatistics() {
  // 重置统计
  logStatistics.total = pluginLogsSizes.value.length;
  logStatistics.system = 0;
  logStatistics.installed = 0;
  logStatistics.deleted = 0;
  logStatistics.split = 0;
  
  // 统计各类日志
  pluginLogsSizes.value.forEach(plugin => {
    // 检查分割日志
    if (isSplitLogFile(plugin.id)) {
      logStatistics.split++;
    }
    
    // 检查系统日志
    if (isSpecialLog(plugin.id)) {
      logStatistics.system++;
    } 
    // 检查已删除插件日志
    else if (isDeletedPluginLog(plugin.id)) {
      logStatistics.deleted++;
    } 
    // 其余为已安装插件日志
    else {
      logStatistics.installed++;
    }
  });
}

// 批量删除函数
function showBatchDeleteConfirm(type) {
  batchDeleteType.value = type;
  
  // 设置确认消息
  if (type === 'deleted') {
    batchDeleteConfirmMessage.value = `确定要删除所有已删除插件的日志文件吗？当前有 ${logStatistics.deleted} 个文件。`;
  } else if (type === 'split') {
    batchDeleteConfirmMessage.value = `确定要删除所有分割日志文件吗？当前有 ${logStatistics.split} 个文件。`;
  } else if (type === 'all') {
    batchDeleteConfirmMessage.value = `确定要删除所有已删除插件日志和分割日志文件吗？当前共有 ${logStatistics.deleted + logStatistics.split} 个文件。`;
  }
  
  showBatchDeleteConfirmDialog.value = true;
}

function cancelBatchDelete() {
  showBatchDeleteConfirmDialog.value = false;
  batchDeleteType.value = null;
  batchDeleteConfirmMessage.value = '';
}

async function confirmBatchDelete() {
  batchDeleting.value = true;
  error.value = null;
  actionMessage.value = null;
  
  try {
    const pluginId = getPluginId();
    let endpoint = '';
    let payload = {};
    
    // 根据类型选择API端点
    if (batchDeleteType.value === 'deleted') {
      endpoint = 'batch_delete';
      payload = { type: 'deleted' };
    } else if (batchDeleteType.value === 'split') {
      endpoint = 'batch_delete';
      payload = { type: 'split' };
    } else if (batchDeleteType.value === 'all') {
      endpoint = 'batch_delete';
      payload = { type: 'all' };
    } else {
      throw new Error('未知的批量删除类型');
    }
    
    // 调用API
    const data = await props.api.post(`plugin/${pluginId}/${endpoint}`, payload);
    
    if (data) {
      if (data.error) {
        throw new Error(data.message || '批量删除操作失败');
      }
      
      // 显示成功消息
      actionMessage.value = data.message || '批量删除操作已完成';
      actionMessageType.value = 'success';
      
      // 刷新日志列表
      setTimeout(() => loadPluginLogsSizes(), 1000);
    } else {
      throw new Error('批量删除请求无响应');
    }
  } catch (err) {
    console.error('批量删除失败:', err);
    error.value = err.message || '批量删除操作失败';
    actionMessageType.value = 'error';
  } finally {
    batchDeleting.value = false;
    showBatchDeleteConfirmDialog.value = false;
    batchDeleteType.value = null;
    setTimeout(() => { actionMessage.value = null; }, 5000);
  }
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

.plugin-list-container, .result-list-container {
  max-height: 200px;
  overflow-y: auto;
}

/* 统一滚动条样式 */
.plugin-list-container::-webkit-scrollbar,
.result-list-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.plugin-list-container::-webkit-scrollbar-track,
.result-list-container::-webkit-scrollbar-track {
  background: transparent;
}

.plugin-list-container::-webkit-scrollbar-thumb,
.result-list-container::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 4px;
}

.plugin-list-container::-webkit-scrollbar-thumb:hover,
.result-list-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.2);
}

/* 优化的颜色类 */
.special-log {
  background-color: #9e9e9e;
}

.deleted-log {
  background-color: #ef5350;
}

.color-primary {
  background-color: #1976d2;
}

.color-success {
  background-color: #4caf50;
}

.color-info {
  background-color: #2196f3;
}

.color-warning {
  background-color: #ff9800;
}

.color-error {
  background-color: #f44336;
}

.color-grey {
  background-color: #9e9e9e;
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
