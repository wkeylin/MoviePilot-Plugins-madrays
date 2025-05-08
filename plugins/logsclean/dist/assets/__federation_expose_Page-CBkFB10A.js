import { i as importShared } from './vuetify-lib-BYoeOZrH.js';
import { _ as _export_sfc } from './_plugin-vue_export-helper-pcqpp-6-.js';

const {resolveComponent:_resolveComponent,createVNode:_createVNode,createElementVNode:_createElementVNode,withCtx:_withCtx,toDisplayString:_toDisplayString,createTextVNode:_createTextVNode,openBlock:_openBlock,createBlock:_createBlock,createCommentVNode:_createCommentVNode,createElementBlock:_createElementBlock,renderList:_renderList,Fragment:_Fragment,normalizeClass:_normalizeClass} = await importShared('vue');


const _hoisted_1 = { class: "plugin-page" };
const _hoisted_2 = {
  key: 3,
  class: "my-1"
};
const _hoisted_3 = {
  class: "text-caption px-2 py-1 rounded",
  style: {"background-color":"rgba(0,0,0,0.05)"}
};
const _hoisted_4 = { class: "text-caption" };
const _hoisted_5 = { class: "text-caption" };
const _hoisted_6 = {
  key: 0,
  class: "text-center text-grey py-1"
};
const _hoisted_7 = { class: "d-flex justify-space-between align-center mb-1" };
const _hoisted_8 = { class: "text-caption text-grey-darken-2" };
const _hoisted_9 = { class: "text-caption" };
const _hoisted_10 = { class: "text-caption text-grey" };
const _hoisted_11 = { class: "d-flex align-center" };
const _hoisted_12 = {
  class: "text-white text-caption",
  style: {"font-size":"10px"}
};
const _hoisted_13 = { class: "text-center" };
const _hoisted_14 = { class: "text-center" };
const _hoisted_15 = { class: "text-center" };
const _hoisted_16 = { class: "d-flex align-center" };
const _hoisted_17 = { class: "d-flex align-center" };
const _hoisted_18 = {
  key: 0,
  class: "d-flex justify-center align-center pa-2"
};
const _hoisted_19 = {
  key: 1,
  class: "text-center text-grey py-2"
};
const _hoisted_20 = { class: "d-flex align-center" };
const _hoisted_21 = {
  class: "text-white text-caption",
  style: {"font-size":"10px"}
};
const _hoisted_22 = { class: "text-center" };
const _hoisted_23 = { class: "text-center" };
const _hoisted_24 = { class: "text-right" };

const {ref,reactive,onMounted,computed} = await importShared('vue');



const _sfc_main = {
  __name: 'Page',
  props: {
  api: {
    type: [Object, Function],
    required: true,
  }
},
  emits: ['switch', 'close'],
  setup(__props, { emit: __emit }) {

const props = __props;

const emit = __emit;

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

return (_ctx, _cache) => {
  const _component_v_icon = _resolveComponent("v-icon");
  const _component_v_card_title = _resolveComponent("v-card-title");
  const _component_v_alert = _resolveComponent("v-alert");
  const _component_v_skeleton_loader = _resolveComponent("v-skeleton-loader");
  const _component_v_list_item_title = _resolveComponent("v-list-item-title");
  const _component_v_chip = _resolveComponent("v-chip");
  const _component_v_list_item = _resolveComponent("v-list-item");
  const _component_v_divider = _resolveComponent("v-divider");
  const _component_v_list = _resolveComponent("v-list");
  const _component_v_card_text = _resolveComponent("v-card-text");
  const _component_v_card = _resolveComponent("v-card");
  const _component_v_col = _resolveComponent("v-col");
  const _component_v_timeline_item = _resolveComponent("v-timeline-item");
  const _component_v_timeline = _resolveComponent("v-timeline");
  const _component_v_row = _resolveComponent("v-row");
  const _component_v_avatar = _resolveComponent("v-avatar");
  const _component_v_table = _resolveComponent("v-table");
  const _component_v_text_field = _resolveComponent("v-text-field");
  const _component_v_tooltip = _resolveComponent("v-tooltip");
  const _component_v_btn = _resolveComponent("v-btn");
  const _component_v_progress_circular = _resolveComponent("v-progress-circular");
  const _component_v_spacer = _resolveComponent("v-spacer");
  const _component_v_card_actions = _resolveComponent("v-card-actions");

  return (_openBlock(), _createElementBlock("div", _hoisted_1, [
    _createVNode(_component_v_card, {
      flat: "",
      class: "rounded border"
    }, {
      default: _withCtx(() => [
        _createVNode(_component_v_card_title, { class: "text-subtitle-1 d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
          default: _withCtx(() => [
            _createVNode(_component_v_icon, {
              icon: "mdi-broom",
              class: "mr-2",
              color: "primary",
              size: "small"
            }),
            _cache[3] || (_cache[3] = _createElementVNode("span", null, "日志清理", -1))
          ]),
          _: 1
        }),
        _createVNode(_component_v_card_text, { class: "px-3 py-2" }, {
          default: _withCtx(() => [
            (error.value)
              ? (_openBlock(), _createBlock(_component_v_alert, {
                  key: 0,
                  type: "error",
                  density: "compact",
                  class: "mb-2 text-caption",
                  variant: "tonal",
                  closable: ""
                }, {
                  default: _withCtx(() => [
                    _createTextVNode(_toDisplayString(error.value), 1)
                  ]),
                  _: 1
                }))
              : _createCommentVNode("", true),
            (actionMessage.value)
              ? (_openBlock(), _createBlock(_component_v_alert, {
                  key: 1,
                  type: actionMessageType.value,
                  density: "compact",
                  class: "mb-2 text-caption",
                  variant: "tonal",
                  closable: ""
                }, {
                  default: _withCtx(() => [
                    _createTextVNode(_toDisplayString(actionMessage.value), 1)
                  ]),
                  _: 1
                }, 8, ["type"]))
              : _createCommentVNode("", true),
            (loading.value && !initialDataLoaded.value)
              ? (_openBlock(), _createBlock(_component_v_skeleton_loader, {
                  key: 2,
                  type: "article, actions"
                }))
              : _createCommentVNode("", true),
            (initialDataLoaded.value)
              ? (_openBlock(), _createElementBlock("div", _hoisted_2, [
                  _createVNode(_component_v_row, null, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_col, {
                        cols: "12",
                        md: "6"
                      }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_card, {
                            flat: "",
                            class: "rounded mb-3 border bg-transparent"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_card_title, { class: "text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
                                default: _withCtx(() => [
                                  _createVNode(_component_v_icon, {
                                    icon: "mdi-information",
                                    class: "mr-2",
                                    color: "primary",
                                    size: "small"
                                  }),
                                  _cache[4] || (_cache[4] = _createElementVNode("span", null, "当前状态", -1))
                                ]),
                                _: 1
                              }),
                              _createVNode(_component_v_card_text, { class: "pa-0" }, {
                                default: _withCtx(() => [
                                  _createVNode(_component_v_list, { class: "bg-transparent pa-0" }, {
                                    default: _withCtx(() => [
                                      _createVNode(_component_v_list_item, { class: "px-3 py-1" }, {
                                        prepend: _withCtx(() => [
                                          _createVNode(_component_v_icon, {
                                            color: statusData.enabled ? 'success' : 'grey',
                                            icon: "mdi-power",
                                            size: "small"
                                          }, null, 8, ["color"])
                                        ]),
                                        append: _withCtx(() => [
                                          _createVNode(_component_v_chip, {
                                            color: statusData.enabled ? 'success' : 'grey',
                                            size: "x-small",
                                            variant: "tonal"
                                          }, {
                                            default: _withCtx(() => [
                                              _createTextVNode(_toDisplayString(statusData.enabled ? '已启用' : '已禁用'), 1)
                                            ]),
                                            _: 1
                                          }, 8, ["color"])
                                        ]),
                                        default: _withCtx(() => [
                                          _createVNode(_component_v_list_item_title, { class: "text-caption" }, {
                                            default: _withCtx(() => _cache[5] || (_cache[5] = [
                                              _createTextVNode("插件状态")
                                            ])),
                                            _: 1
                                          })
                                        ]),
                                        _: 1
                                      }),
                                      _createVNode(_component_v_divider, { class: "my-1" }),
                                      _createVNode(_component_v_list_item, { class: "px-3 py-1" }, {
                                        prepend: _withCtx(() => [
                                          _createVNode(_component_v_icon, {
                                            icon: "mdi-code-braces",
                                            color: "primary",
                                            size: "small"
                                          })
                                        ]),
                                        append: _withCtx(() => [
                                          _createElementVNode("code", _hoisted_3, _toDisplayString(statusData.cron || '未设置'), 1)
                                        ]),
                                        default: _withCtx(() => [
                                          _createVNode(_component_v_list_item_title, { class: "text-caption" }, {
                                            default: _withCtx(() => _cache[6] || (_cache[6] = [
                                              _createTextVNode("CRON表达式")
                                            ])),
                                            _: 1
                                          })
                                        ]),
                                        _: 1
                                      }),
                                      _createVNode(_component_v_divider, { class: "my-1" }),
                                      _createVNode(_component_v_list_item, { class: "px-3 py-1" }, {
                                        prepend: _withCtx(() => [
                                          _createVNode(_component_v_icon, {
                                            icon: "mdi-clock-time-five",
                                            color: "amber-darken-2",
                                            size: "small"
                                          })
                                        ]),
                                        append: _withCtx(() => [
                                          _createElementVNode("span", _hoisted_4, _toDisplayString(statusData.next_run_time || '未知'), 1)
                                        ]),
                                        default: _withCtx(() => [
                                          _createVNode(_component_v_list_item_title, { class: "text-caption" }, {
                                            default: _withCtx(() => _cache[7] || (_cache[7] = [
                                              _createTextVNode("下次运行")
                                            ])),
                                            _: 1
                                          })
                                        ]),
                                        _: 1
                                      }),
                                      _createVNode(_component_v_divider, { class: "my-1" }),
                                      _createVNode(_component_v_list_item, { class: "px-3 py-1" }, {
                                        prepend: _withCtx(() => [
                                          _createVNode(_component_v_icon, {
                                            icon: "mdi-counter",
                                            color: "teal",
                                            size: "small"
                                          })
                                        ]),
                                        append: _withCtx(() => [
                                          _createElementVNode("span", _hoisted_5, _toDisplayString(statusData.rows || 300) + " 行", 1)
                                        ]),
                                        default: _withCtx(() => [
                                          _createVNode(_component_v_list_item_title, { class: "text-caption" }, {
                                            default: _withCtx(() => _cache[8] || (_cache[8] = [
                                              _createTextVNode("保留日志行数")
                                            ])),
                                            _: 1
                                          })
                                        ]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      _createVNode(_component_v_col, {
                        cols: "12",
                        md: "6"
                      }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_card, {
                            flat: "",
                            class: "rounded mb-3 border bg-transparent"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_card_title, { class: "text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
                                default: _withCtx(() => [
                                  _createVNode(_component_v_icon, {
                                    icon: "mdi-history",
                                    class: "mr-2",
                                    color: "primary",
                                    size: "small"
                                  }),
                                  _cache[9] || (_cache[9] = _createElementVNode("span", null, "清理历史", -1))
                                ]),
                                _: 1
                              }),
                              _createVNode(_component_v_card_text, { class: "px-3 py-2" }, {
                                default: _withCtx(() => [
                                  (!statusData.cleaning_history?.length)
                                    ? (_openBlock(), _createElementBlock("div", _hoisted_6, [
                                        _createVNode(_component_v_icon, {
                                          icon: "mdi-information-outline",
                                          size: "small",
                                          class: "mb-1"
                                        }),
                                        _cache[10] || (_cache[10] = _createElementVNode("div", { class: "text-caption" }, "暂无清理历史记录", -1))
                                      ]))
                                    : (_openBlock(), _createBlock(_component_v_timeline, {
                                        key: 1,
                                        density: "compact",
                                        align: "start",
                                        "truncate-line": "both",
                                        class: "mt-0"
                                      }, {
                                        default: _withCtx(() => [
                                          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(statusData.cleaning_history.slice(0, 3), (item, index) => {
                                            return (_openBlock(), _createBlock(_component_v_timeline_item, {
                                              key: index,
                                              "dot-color": getHistoryColor(index),
                                              size: "x-small"
                                            }, {
                                              icon: _withCtx(() => [
                                                _createVNode(_component_v_icon, { size: "x-small" }, {
                                                  default: _withCtx(() => _cache[11] || (_cache[11] = [
                                                    _createTextVNode("mdi-broom")
                                                  ])),
                                                  _: 1
                                                })
                                              ]),
                                              default: _withCtx(() => [
                                                _createElementVNode("div", _hoisted_7, [
                                                  _createElementVNode("span", _hoisted_8, _toDisplayString(item.timestamp), 1),
                                                  _createVNode(_component_v_chip, {
                                                    size: "x-small",
                                                    color: getHistoryColor(index),
                                                    variant: "flat"
                                                  }, {
                                                    default: _withCtx(() => [
                                                      _createTextVNode(" #" + _toDisplayString(index + 1), 1)
                                                    ]),
                                                    _: 2
                                                  }, 1032, ["color"])
                                                ]),
                                                _createElementVNode("div", _hoisted_9, [
                                                  _cache[12] || (_cache[12] = _createTextVNode(" 清理 ")),
                                                  _createElementVNode("strong", null, _toDisplayString(item.total_lines_cleaned), 1),
                                                  _createTextVNode(" 行 (" + _toDisplayString(item.total_plugins_processed) + " 个插件) ", 1)
                                                ])
                                              ]),
                                              _: 2
                                            }, 1032, ["dot-color"]))
                                          }), 128)),
                                          (statusData.cleaning_history.length > 3)
                                            ? (_openBlock(), _createBlock(_component_v_timeline_item, {
                                                key: 0,
                                                "dot-color": "grey",
                                                size: "x-small"
                                              }, {
                                                icon: _withCtx(() => [
                                                  _createVNode(_component_v_icon, { size: "x-small" }, {
                                                    default: _withCtx(() => _cache[13] || (_cache[13] = [
                                                      _createTextVNode("mdi-dots-horizontal")
                                                    ])),
                                                    _: 1
                                                  })
                                                ]),
                                                default: _withCtx(() => [
                                                  _createElementVNode("div", _hoisted_10, " 还有 " + _toDisplayString(statusData.cleaning_history.length - 3) + " 条历史记录... ", 1)
                                                ]),
                                                _: 1
                                              }))
                                            : _createCommentVNode("", true)
                                        ]),
                                        _: 1
                                      }))
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_card, {
                    flat: "",
                    class: "rounded mb-3 border bg-transparent"
                  }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_card_title, { class: "text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_icon, {
                            icon: "mdi-file-document",
                            class: "mr-2",
                            color: "primary",
                            size: "small"
                          }),
                          _cache[14] || (_cache[14] = _createElementVNode("span", null, "上次清理详情", -1)),
                          _createVNode(_component_v_chip, {
                            class: "ml-1",
                            size: "x-small",
                            color: "info",
                            variant: "flat"
                          }, {
                            default: _withCtx(() => [
                              _createTextVNode(_toDisplayString(statusData.last_run_results?.length || 0) + " 个插件", 1)
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }),
                      (!statusData.last_run_results?.length)
                        ? (_openBlock(), _createBlock(_component_v_card_text, {
                            key: 0,
                            class: "text-center text-grey pa-2"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_icon, {
                                icon: "mdi-information-outline",
                                size: "small",
                                class: "mb-1"
                              }),
                              _cache[15] || (_cache[15] = _createElementVNode("div", { class: "text-caption" }, "暂无上次运行数据", -1))
                            ]),
                            _: 1
                          }))
                        : (_openBlock(), _createBlock(_component_v_card_text, {
                            key: 1,
                            class: "pa-0"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_table, {
                                density: "compact",
                                hover: "",
                                class: "text-caption"
                              }, {
                                default: _withCtx(() => [
                                  _cache[16] || (_cache[16] = _createElementVNode("thead", null, [
                                    _createElementVNode("tr", null, [
                                      _createElementVNode("th", { class: "text-caption" }, "插件名称"),
                                      _createElementVNode("th", { class: "text-caption text-center" }, "原行数"),
                                      _createElementVNode("th", { class: "text-caption text-center" }, "保留行数"),
                                      _createElementVNode("th", { class: "text-caption text-center" }, "清理行数")
                                    ])
                                  ], -1)),
                                  _createElementVNode("tbody", null, [
                                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(statusData.last_run_results, (item, index) => {
                                      return (_openBlock(), _createElementBlock("tr", { key: index }, [
                                        _createElementVNode("td", null, [
                                          _createElementVNode("div", _hoisted_11, [
                                            _createVNode(_component_v_avatar, {
                                              size: "18",
                                              class: "mr-1",
                                              color: getPluginColor(index)
                                            }, {
                                              default: _withCtx(() => [
                                                _createElementVNode("span", _hoisted_12, _toDisplayString(getPluginInitial(getPluginDisplayName(item.plugin_id))), 1)
                                              ]),
                                              _: 2
                                            }, 1032, ["color"]),
                                            _createTextVNode(" " + _toDisplayString(getPluginDisplayName(item.plugin_id)), 1)
                                          ])
                                        ]),
                                        _createElementVNode("td", _hoisted_13, _toDisplayString(item.original_lines), 1),
                                        _createElementVNode("td", _hoisted_14, _toDisplayString(item.kept_lines), 1),
                                        _createElementVNode("td", _hoisted_15, [
                                          _createVNode(_component_v_chip, {
                                            size: "x-small",
                                            color: "success",
                                            variant: "flat"
                                          }, {
                                            default: _withCtx(() => [
                                              _createTextVNode(_toDisplayString(item.cleaned_lines), 1)
                                            ]),
                                            _: 2
                                          }, 1024)
                                        ])
                                      ]))
                                    }), 128))
                                  ])
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }))
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_card, {
                    flat: "",
                    class: "rounded mb-3 border bg-transparent"
                  }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_card_title, { class: "text-caption d-flex align-center justify-space-between px-3 py-2 bg-primary-lighten-5 flex-wrap" }, {
                        default: _withCtx(() => [
                          _createElementVNode("div", _hoisted_16, [
                            _createVNode(_component_v_icon, {
                              icon: "mdi-view-list",
                              class: "mr-2",
                              color: "primary",
                              size: "small"
                            }),
                            _cache[17] || (_cache[17] = _createElementVNode("span", null, "插件日志状态", -1))
                          ]),
                          _createElementVNode("div", _hoisted_17, [
                            _createVNode(_component_v_text_field, {
                              modelValue: pluginSearch.value,
                              "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((pluginSearch).value = $event)),
                              density: "compact",
                              "hide-details": "",
                              placeholder: "搜索插件...",
                              "prepend-inner-icon": "mdi-magnify",
                              variant: "outlined",
                              class: "max-width-120 my-1",
                              "bg-color": "white",
                              style: {"font-size":"12px"}
                            }, null, 8, ["modelValue"]),
                            _createVNode(_component_v_btn, {
                              variant: "text",
                              color: "primary",
                              size: "x-small",
                              icon: "mdi-refresh",
                              class: "ml-1",
                              loading: refreshingPluginLogs.value,
                              onClick: loadPluginLogsSizes
                            }, {
                              default: _withCtx(() => [
                                _createVNode(_component_v_tooltip, {
                                  activator: "parent",
                                  location: "top"
                                }, {
                                  default: _withCtx(() => _cache[18] || (_cache[18] = [
                                    _createTextVNode("刷新插件状态")
                                  ])),
                                  _: 1
                                })
                              ]),
                              _: 1
                            }, 8, ["loading"])
                          ])
                        ]),
                        _: 1
                      }),
                      _createVNode(_component_v_card_text, { class: "pa-0" }, {
                        default: _withCtx(() => [
                          (refreshingPluginLogs.value)
                            ? (_openBlock(), _createElementBlock("div", _hoisted_18, [
                                _createVNode(_component_v_progress_circular, {
                                  indeterminate: "",
                                  color: "primary",
                                  size: "20"
                                }),
                                _cache[19] || (_cache[19] = _createElementVNode("span", { class: "text-caption ml-2" }, "加载插件日志信息...", -1))
                              ]))
                            : (!installedPluginLogs.value.length)
                              ? (_openBlock(), _createElementBlock("div", _hoisted_19, [
                                  _createVNode(_component_v_icon, {
                                    icon: "mdi-information-outline",
                                    size: "small",
                                    class: "mb-1"
                                  }),
                                  _cache[20] || (_cache[20] = _createElementVNode("div", { class: "text-caption" }, "未找到已安装插件的日志", -1))
                                ]))
                              : (_openBlock(), _createBlock(_component_v_table, {
                                  key: 2,
                                  density: "compact",
                                  hover: "",
                                  class: "text-caption"
                                }, {
                                  default: _withCtx(() => [
                                    _cache[23] || (_cache[23] = _createElementVNode("thead", null, [
                                      _createElementVNode("tr", null, [
                                        _createElementVNode("th", { class: "text-caption" }, "插件名称"),
                                        _createElementVNode("th", { class: "text-caption text-center" }, "日志大小"),
                                        _createElementVNode("th", { class: "text-caption text-center" }, "行数"),
                                        _createElementVNode("th", { class: "text-caption text-right" }, "操作")
                                      ])
                                    ], -1)),
                                    _createElementVNode("tbody", null, [
                                      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(filteredPluginLogs.value, (plugin, index) => {
                                        return (_openBlock(), _createElementBlock("tr", { key: index }, [
                                          _createElementVNode("td", null, [
                                            _createElementVNode("div", _hoisted_20, [
                                              _createVNode(_component_v_avatar, {
                                                size: "18",
                                                class: "mr-1",
                                                color: isSpecialLog(plugin.id) ? 'grey-lighten-1' : getPluginColor(index),
                                                variant: "flat"
                                              }, {
                                                default: _withCtx(() => [
                                                  _createElementVNode("span", _hoisted_21, _toDisplayString(getPluginInitial(plugin.name)), 1)
                                                ]),
                                                _: 2
                                              }, 1032, ["color"]),
                                              _createElementVNode("span", {
                                                class: _normalizeClass({ 'text-grey': isSpecialLog(plugin.id) })
                                              }, [
                                                _createTextVNode(_toDisplayString(plugin.name) + " ", 1),
                                                (isSpecialLog(plugin.id))
                                                  ? (_openBlock(), _createBlock(_component_v_chip, {
                                                      key: 0,
                                                      size: "x-small",
                                                      color: "grey-lighten-2",
                                                      class: "ml-1"
                                                    }, {
                                                      default: _withCtx(() => _cache[21] || (_cache[21] = [
                                                        _createTextVNode("系统日志")
                                                      ])),
                                                      _: 1
                                                    }))
                                                  : _createCommentVNode("", true)
                                              ], 2)
                                            ])
                                          ]),
                                          _createElementVNode("td", _hoisted_22, [
                                            _createVNode(_component_v_chip, {
                                              size: "x-small",
                                              color: getPluginSizeColor(plugin.size),
                                              variant: "flat"
                                            }, {
                                              default: _withCtx(() => [
                                                _createTextVNode(_toDisplayString(formatFileSize(plugin.size)), 1)
                                              ]),
                                              _: 2
                                            }, 1032, ["color"])
                                          ]),
                                          _createElementVNode("td", _hoisted_23, _toDisplayString(plugin.lines_count), 1),
                                          _createElementVNode("td", _hoisted_24, [
                                            _createVNode(_component_v_btn, {
                                              density: "comfortable",
                                              icon: "",
                                              variant: "text",
                                              color: "error",
                                              size: "x-small",
                                              disabled: !statusData.enabled || cleaningSpecificPlugin.value === plugin.id,
                                              loading: cleaningSpecificPlugin.value === plugin.id,
                                              onClick: $event => (cleanSpecificPlugin(plugin.id, plugin.name))
                                            }, {
                                              default: _withCtx(() => [
                                                _createVNode(_component_v_icon, {
                                                  icon: "mdi-broom",
                                                  size: "small"
                                                }),
                                                _createVNode(_component_v_tooltip, {
                                                  activator: "parent",
                                                  location: "top"
                                                }, {
                                                  default: _withCtx(() => _cache[22] || (_cache[22] = [
                                                    _createTextVNode("清理此日志")
                                                  ])),
                                                  _: 1
                                                })
                                              ]),
                                              _: 2
                                            }, 1032, ["disabled", "loading", "onClick"])
                                          ])
                                        ]))
                                      }), 128))
                                    ])
                                  ]),
                                  _: 1
                                }))
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]))
              : _createCommentVNode("", true)
          ]),
          _: 1
        }),
        _createVNode(_component_v_divider),
        _createVNode(_component_v_card_actions, { class: "px-2 py-1" }, {
          default: _withCtx(() => [
            _createVNode(_component_v_btn, {
              color: "primary",
              onClick: _cache[1] || (_cache[1] = $event => (emit('switch'))),
              "prepend-icon": "mdi-cog",
              variant: "text",
              size: "small"
            }, {
              default: _withCtx(() => _cache[24] || (_cache[24] = [
                _createTextVNode("配置")
              ])),
              _: 1
            }),
            _createVNode(_component_v_spacer),
            _createVNode(_component_v_btn, {
              color: "info",
              onClick: fetchStatusData,
              loading: loading.value,
              "prepend-icon": "mdi-refresh",
              variant: "text",
              size: "small"
            }, {
              default: _withCtx(() => _cache[25] || (_cache[25] = [
                _createTextVNode("刷新状态")
              ])),
              _: 1
            }, 8, ["loading"]),
            _createVNode(_component_v_btn, {
              color: "success",
              onClick: runCleanNow,
              loading: cleaningNow.value,
              "prepend-icon": "mdi-broom",
              disabled: !statusData.enabled,
              variant: "text",
              size: "small"
            }, {
              default: _withCtx(() => _cache[26] || (_cache[26] = [
                _createTextVNode(" 立即清理全部 ")
              ])),
              _: 1
            }, 8, ["loading", "disabled"]),
            _createVNode(_component_v_btn, {
              color: "grey",
              onClick: _cache[2] || (_cache[2] = $event => (emit('close'))),
              "prepend-icon": "mdi-close",
              variant: "text",
              size: "small"
            }, {
              default: _withCtx(() => _cache[27] || (_cache[27] = [
                _createTextVNode("关闭")
              ])),
              _: 1
            })
          ]),
          _: 1
        })
      ]),
      _: 1
    })
  ]))
}
}

};
const PageComponent = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-33f32b68"]]);

export { PageComponent as default };
