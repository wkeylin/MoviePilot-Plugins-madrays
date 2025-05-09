import { importShared } from './__federation_fn_import-054b33c3.js';
import { _ as _export_sfc } from './_plugin-vue_export-helper-c4c0bc37.js';

const Page_vue_vue_type_style_index_0_lang = '';

const {defineComponent,ref,reactive,toRefs,computed,onMounted} = await importShared('vue');


const _sfc_main = defineComponent({
  name: 'Page',
  
  props: {
    api: {
      type: [Object, Function],
      required: true
    }
  },
  
  emits: ['switch', 'close'],
  
  setup(props, { emit }) {
    // 状态
    const state = reactive({
      error: null,
      loading: true,
      refreshing: false,
      initialDataLoaded: false,
      actionMessage: null,
      actionMessageType: 'info',
      actionLoading: false,
      statusData: {
        enabled: false,
        cron: '',
        next_run_time: '',
        monitor_paths: [],
        exclude_dirs: [],
        only_when_no_download: false,
        dir_history_count: 0,
        cleanup_rules: {
          empty_dir: false,
          small_dir: {
            enabled: false,
            max_size: 10
          },
          size_reduction: {
            enabled: false,
            threshold: 80
          }
        }
      },
      pathStats: [],
      showCleanResultDialog: false,
      cleanResult: null,
      downloaders: [],
      loadingDownloaders: false,
      cleanHistory: [],
      loadingHistory: false,
      showHistoryDialog: false
    });
    
    // 计算属性：有效的路径统计
    const validPathStats = computed(() => {
      return state.pathStats.filter(path => path.exists && path.status === 'valid');
    });
    
    // 计算属性：清理规则
    const cleanupRules = computed(() => {
      return state.statusData.cleanup_rules || {
        empty_dir: false,
        small_dir: {
          enabled: false,
          max_size: 10
        },
        size_reduction: {
          enabled: false,
          threshold: 80
        }
      };
    });
    
    // 计算属性：下载器是否有活动任务
    const downloadersHaveActiveTasks = computed(() => {
      return state.downloaders.some(downloader => downloader.hasActiveTasks);
    });
    
    // 加载状态数据
    const loadStatusData = async () => {
      try {
        state.error = null;
        state.loading = true;
        
        const response = await props.api.get('plugin/TrashClean/status');
        if (response) {
          state.statusData = response;
          state.initialDataLoaded = true;
        }
      } catch (error) {
        state.error = `加载状态数据失败: ${error.message || error}`;
        console.error('加载状态数据失败:', error);
      } finally {
        state.loading = false;
      }
    };
    
    // 加载路径统计数据
    const loadPathStats = async () => {
      try {
        const response = await props.api.get('plugin/TrashClean/stats');
        if (response) {
          state.pathStats = response;
        }
      } catch (error) {
        state.error = `加载路径统计数据失败: ${error.message || error}`;
        console.error('加载路径统计数据失败:', error);
      }
    };
    
    // 加载下载器状态
    const loadDownloaderStatus = async () => {
      try {
        state.loadingDownloaders = true;
        
        const response = await props.api.get('plugin/TrashClean/downloaders');
        if (response && Array.isArray(response)) {
          state.downloaders = response;
        } else {
          state.downloaders = [];
        }
      } catch (error) {
        console.error('加载下载器状态失败:', error);
        state.downloaders = [];
      } finally {
        state.loadingDownloaders = false;
      }
    };
    
    // 加载清理历史记录
    const loadCleanHistory = async () => {
      try {
        state.loadingHistory = true;
        const response = await props.api.get('plugin/TrashClean/history');
        if (response) {
          state.cleanHistory = response;
        } else {
          state.cleanHistory = [];
        }
      } catch (error) {
        console.error('加载清理历史记录失败:', error);
        state.cleanHistory = [];
      } finally {
        state.loadingHistory = false;
      }
    };
    
    // 刷新所有数据
    const refreshData = async () => {
      try {
        state.refreshing = true;
        state.error = null;
        state.actionMessage = null;
        
        await loadStatusData();
        await loadPathStats();
        
        // 如果启用了只在无下载任务时执行，则加载下载器状态
        if (state.statusData.only_when_no_download) {
          await loadDownloaderStatus();
        }
        
        // 如果有历史记录，加载历史数据
        if (state.statusData.dir_history_count > 0) {
          await loadCleanHistory();
        }
        
        state.actionMessage = '数据刷新成功';
        state.actionMessageType = 'success';
        
        // 3秒后清除成功消息
        setTimeout(() => {
          state.actionMessage = null;
        }, 3000);
      } catch (error) {
        state.error = `刷新数据失败: ${error.message || error}`;
        console.error('刷新数据失败:', error);
      } finally {
        state.refreshing = false;
      }
    };
    
    // 触发手动清理
    const triggerClean = async () => {
      try {
        state.actionLoading = true;
        state.error = null;
        state.actionMessage = null;
        
        const response = await props.api.post('plugin/TrashClean/clean');
        
        if (response) {
          state.cleanResult = response;
          state.showCleanResultDialog = true;
          
          // 刷新数据
          await refreshData();
        }
      } catch (error) {
        state.error = `手动清理失败: ${error.message || error}`;
        console.error('手动清理失败:', error);
      } finally {
        state.actionLoading = false;
      }
    };
    
    // 格式化文件大小
    const formatSize = (bytes) => {
      if (bytes === 0) return '0 B';
      
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      
      return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
    };
    
    // 获取清理类型对应的颜色
    const getCleanTypeColor = (type) => {
      switch (type) {
        case 'empty':
          return 'success';
        case 'small':
          return 'warning';
        case 'size_reduction':
          return 'error';
        default:
          return 'grey';
      }
    };
    
    // 获取清理类型对应的文本
    const getCleanTypeText = (type) => {
      switch (type) {
        case 'empty':
          return '空目录';
        case 'small':
          return '小体积';
        case 'size_reduction':
          return '体积减少';
        default:
          return '未知';
      }
    };
    
    // 格式化日期时间
    const formatDate = (date) => {
      if (!date) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    
    // 获取清理类型对应的图标
    const getCleanTypeIcon = (type) => {
      switch (type) {
        case 'empty':
          return 'mdi-folder-remove';
        case 'small':
          return 'mdi-weight';
        case 'size_reduction':
          return 'mdi-chart-line-variant';
        default:
          return 'mdi-folder';
      }
    };
    
    // 添加格式化速度函数
    const formatSpeed = (bytesPerSecond) => {
      if (bytesPerSecond < 0 || bytesPerSecond === undefined) return "未知";
      const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
      let speed = bytesPerSecond;
      let unitIndex = 0;
      
      while (speed >= 1024 && unitIndex < units.length - 1) {
        speed /= 1024;
        unitIndex++;
      }
      
      return speed.toFixed(2) + ' ' + units[unitIndex];
    };
    
    // 添加格式化时间函数
    const formatETA = (seconds) => {
      if (seconds < 0 || seconds === undefined || seconds >= 8640000) return "未知";
      
      if (seconds < 60) {
        return `${seconds}秒`;
      } else if (seconds < 3600) {
        return `${Math.floor(seconds / 60)}分钟`;
      } else if (seconds < 86400) {
        return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分钟`;
      } else {
        return `${Math.floor(seconds / 86400)}天${Math.floor((seconds % 86400) / 3600)}小时`;
      }
    };
    
    // 获取历史记录颜色
    const getHistoryColor = (index) => {
      const colors = ['success', 'warning', 'error'];
      return colors[index % colors.length];
    };
    
    // 组件挂载时加载数据
    onMounted(() => {
      refreshData();
    });
    
    return {
      ...toRefs(state),
      validPathStats,
      cleanupRules,
      downloadersHaveActiveTasks,
      refreshData,
      triggerClean,
      formatSize,
      getCleanTypeColor,
      getCleanTypeText,
      loadCleanHistory,
      formatDate,
      getCleanTypeIcon,
      formatSpeed,
      formatETA,
      emit,
      getHistoryColor
    };
  }
});

const {resolveComponent:_resolveComponent,createVNode:_createVNode,createElementVNode:_createElementVNode,withCtx:_withCtx,toDisplayString:_toDisplayString,createTextVNode:_createTextVNode,openBlock:_openBlock,createBlock:_createBlock,createCommentVNode:_createCommentVNode,createElementBlock:_createElementBlock,renderList:_renderList,Fragment:_Fragment} = await importShared('vue');


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
const _hoisted_5 = {
  key: 0,
  class: "text-center text-grey py-3"
};
const _hoisted_6 = {
  key: 0,
  class: "text-center text-grey py-3"
};
const _hoisted_7 = { class: "d-flex align-center" };
const _hoisted_8 = {
  key: 0,
  class: "d-flex justify-center py-4"
};
const _hoisted_9 = {
  key: 1,
  class: "text-center text-grey py-3"
};
const _hoisted_10 = { key: 2 };
const _hoisted_11 = { class: "downloader-grid pa-2" };
const _hoisted_12 = { class: "d-flex align-center px-3 py-2" };
const _hoisted_13 = { class: "font-weight-medium" };
const _hoisted_14 = { class: "text-caption" };
const _hoisted_15 = { class: "d-flex align-center" };
const _hoisted_16 = { class: "tasks-container" };
const _hoisted_17 = { class: "d-flex align-center mb-1" };
const _hoisted_18 = ["title"];
const _hoisted_19 = { class: "task-info d-flex align-center justify-space-between mt-1" };
const _hoisted_20 = { class: "text-caption progress-value ml-2" };
const _hoisted_21 = { class: "task-details d-flex flex-wrap justify-space-between mt-2" };
const _hoisted_22 = { class: "info-chip" };
const _hoisted_23 = { class: "info-chip" };
const _hoisted_24 = { class: "info-chip" };
const _hoisted_25 = {
  key: 0,
  class: "text-caption mr-2"
};
const _hoisted_26 = {
  key: 0,
  class: "text-caption mr-2"
};
const _hoisted_27 = { class: "d-flex align-center" };
const _hoisted_28 = {
  class: "text-truncate",
  style: {"max-width":"300px"}
};
const _hoisted_29 = { class: "text-center" };
const _hoisted_30 = { class: "text-center" };
const _hoisted_31 = { class: "text-center" };
const _hoisted_32 = { key: 0 };
const _hoisted_33 = { class: "d-flex align-center px-2 py-1" };
const _hoisted_34 = { class: "text-caption" };
const _hoisted_35 = { class: "d-flex align-center" };
const _hoisted_36 = {
  key: 0,
  class: "text-caption mr-2"
};
const _hoisted_37 = {
  key: 1,
  class: "text-caption mr-2"
};
const _hoisted_38 = {
  key: 1,
  class: "text-center py-3"
};
const _hoisted_39 = {
  key: 0,
  class: "text-center text-grey py-1"
};
const _hoisted_40 = { class: "d-flex justify-space-between align-center mb-1" };
const _hoisted_41 = { class: "text-caption text-grey-darken-2" };
const _hoisted_42 = { class: "text-caption" };
const _hoisted_43 = { class: "text-caption d-flex align-center" };
const _hoisted_44 = { class: "text-grey" };
const _hoisted_45 = { key: 0 };
const _hoisted_46 = { key: 0 };
const _hoisted_47 = {
  key: 1,
  class: "text-center py-2"
};
const _hoisted_48 = { class: "d-flex justify-space-between align-center mb-1" };
const _hoisted_49 = { class: "text-caption font-weight-medium" };
const _hoisted_50 = { class: "text-body-2" };
const _hoisted_51 = { class: "d-flex flex-wrap text-caption mt-1" };
const _hoisted_52 = {
  key: 1,
  class: "d-flex align-center justify-center py-4"
};

function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
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
  const _component_v_card_actions = _resolveComponent("v-card-actions");
  const _component_v_card = _resolveComponent("v-card");
  const _component_v_col = _resolveComponent("v-col");
  const _component_v_row = _resolveComponent("v-row");
  const _component_v_progress_circular = _resolveComponent("v-progress-circular");
  const _component_v_avatar = _resolveComponent("v-avatar");
  const _component_v_spacer = _resolveComponent("v-spacer");
  const _component_v_expansion_panel_title = _resolveComponent("v-expansion-panel-title");
  const _component_v_progress_linear = _resolveComponent("v-progress-linear");
  const _component_v_expansion_panel_text = _resolveComponent("v-expansion-panel-text");
  const _component_v_expansion_panel = _resolveComponent("v-expansion-panel");
  const _component_v_expansion_panels = _resolveComponent("v-expansion-panels");
  const _component_v_table = _resolveComponent("v-table");
  const _component_v_timeline_item = _resolveComponent("v-timeline-item");
  const _component_v_btn = _resolveComponent("v-btn");
  const _component_v_timeline = _resolveComponent("v-timeline");
  const _component_v_dialog = _resolveComponent("v-dialog");

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
            _cache[7] || (_cache[7] = _createElementVNode("span", null, "垃圾文件清理", -1))
          ]),
          _: 1
        }),
        _createVNode(_component_v_card_text, { class: "px-3 py-2" }, {
          default: _withCtx(() => [
            (_ctx.error)
              ? (_openBlock(), _createBlock(_component_v_alert, {
                  key: 0,
                  type: "error",
                  density: "compact",
                  class: "mb-2 text-caption",
                  variant: "tonal",
                  closable: ""
                }, {
                  default: _withCtx(() => [
                    _createTextVNode(_toDisplayString(_ctx.error), 1)
                  ]),
                  _: 1
                }))
              : _createCommentVNode("", true),
            (_ctx.actionMessage)
              ? (_openBlock(), _createBlock(_component_v_alert, {
                  key: 1,
                  type: _ctx.actionMessageType,
                  density: "compact",
                  class: "mb-2 text-caption",
                  variant: "tonal",
                  closable: ""
                }, {
                  default: _withCtx(() => [
                    _createTextVNode(_toDisplayString(_ctx.actionMessage), 1)
                  ]),
                  _: 1
                }, 8, ["type"]))
              : _createCommentVNode("", true),
            (_ctx.loading && !_ctx.initialDataLoaded)
              ? (_openBlock(), _createBlock(_component_v_skeleton_loader, {
                  key: 2,
                  type: "article, actions"
                }))
              : _createCommentVNode("", true),
            (_ctx.initialDataLoaded)
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
                            class: "rounded mb-3 border config-card"
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
                                  _cache[8] || (_cache[8] = _createElementVNode("span", null, "当前状态", -1))
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
                                            color: _ctx.statusData.enabled ? 'success' : 'grey',
                                            icon: "mdi-power",
                                            size: "small"
                                          }, null, 8, ["color"])
                                        ]),
                                        append: _withCtx(() => [
                                          _createVNode(_component_v_chip, {
                                            color: _ctx.statusData.enabled ? 'success' : 'grey',
                                            size: "x-small",
                                            variant: "tonal"
                                          }, {
                                            default: _withCtx(() => [
                                              _createTextVNode(_toDisplayString(_ctx.statusData.enabled ? '已启用' : '已禁用'), 1)
                                            ]),
                                            _: 1
                                          }, 8, ["color"])
                                        ]),
                                        default: _withCtx(() => [
                                          _createVNode(_component_v_list_item_title, { class: "text-caption" }, {
                                            default: _withCtx(() => _cache[9] || (_cache[9] = [
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
                                          _createElementVNode("code", _hoisted_3, _toDisplayString(_ctx.statusData.cron || '未设置'), 1)
                                        ]),
                                        default: _withCtx(() => [
                                          _createVNode(_component_v_list_item_title, { class: "text-caption" }, {
                                            default: _withCtx(() => _cache[10] || (_cache[10] = [
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
                                          _createElementVNode("span", _hoisted_4, _toDisplayString(_ctx.statusData.next_run_time || '未知'), 1)
                                        ]),
                                        default: _withCtx(() => [
                                          _createVNode(_component_v_list_item_title, { class: "text-caption" }, {
                                            default: _withCtx(() => _cache[11] || (_cache[11] = [
                                              _createTextVNode("下次运行")
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
                              }),
                              _createVNode(_component_v_divider),
                              _createVNode(_component_v_card_actions, { class: "px-3 py-2" })
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
                            class: "rounded mb-3 border config-card"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_card_title, { class: "text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
                                default: _withCtx(() => [
                                  _createVNode(_component_v_icon, {
                                    icon: "mdi-folder-search",
                                    class: "mr-2",
                                    color: "primary",
                                    size: "small"
                                  }),
                                  _cache[12] || (_cache[12] = _createElementVNode("span", null, "监控路径", -1)),
                                  _createVNode(_component_v_chip, {
                                    class: "ml-1",
                                    size: "x-small",
                                    color: "info",
                                    variant: "flat"
                                  }, {
                                    default: _withCtx(() => [
                                      _createTextVNode(_toDisplayString(_ctx.pathStats.length || 0) + " 个路径", 1)
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              _createVNode(_component_v_card_text, { class: "pa-0" }, {
                                default: _withCtx(() => [
                                  (!_ctx.pathStats.length)
                                    ? (_openBlock(), _createElementBlock("div", _hoisted_5, [
                                        _createVNode(_component_v_icon, {
                                          icon: "mdi-folder-off",
                                          size: "small",
                                          class: "mb-1"
                                        }),
                                        _cache[13] || (_cache[13] = _createElementVNode("div", { class: "text-caption" }, "未设置任何监控路径", -1))
                                      ]))
                                    : (_openBlock(), _createBlock(_component_v_list, {
                                        key: 1,
                                        class: "pa-0 bg-transparent",
                                        density: "compact"
                                      }, {
                                        default: _withCtx(() => [
                                          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.pathStats, (path, index) => {
                                            return (_openBlock(), _createBlock(_component_v_list_item, {
                                              key: index,
                                              class: "px-3 py-1"
                                            }, {
                                              prepend: _withCtx(() => [
                                                _createVNode(_component_v_icon, {
                                                  icon: path.exists ? 'mdi-folder' : 'mdi-folder-off',
                                                  color: path.exists ? 'amber-darken-2' : 'grey',
                                                  size: "small",
                                                  class: "mr-2"
                                                }, null, 8, ["icon", "color"])
                                              ]),
                                              append: _withCtx(() => [
                                                _createVNode(_component_v_chip, {
                                                  size: "x-small",
                                                  color: path.exists ? (path.status === 'valid' ? 'success' : 'error') : 'grey',
                                                  variant: "flat"
                                                }, {
                                                  default: _withCtx(() => [
                                                    _createTextVNode(_toDisplayString(path.exists ? (path.status === 'valid' ? '可用' : '错误') : '不存在'), 1)
                                                  ]),
                                                  _: 2
                                                }, 1032, ["color"])
                                              ]),
                                              default: _withCtx(() => [
                                                _createVNode(_component_v_list_item_title, { class: "text-caption" }, {
                                                  default: _withCtx(() => [
                                                    _createTextVNode(_toDisplayString(path.path), 1)
                                                  ]),
                                                  _: 2
                                                }, 1024)
                                              ]),
                                              _: 2
                                            }, 1024))
                                          }), 128))
                                        ]),
                                        _: 1
                                      }))
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          _createVNode(_component_v_card, {
                            flat: "",
                            class: "rounded mb-3 border config-card"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_card_title, { class: "text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
                                default: _withCtx(() => [
                                  _createVNode(_component_v_icon, {
                                    icon: "mdi-folder-remove",
                                    class: "mr-2",
                                    color: "primary",
                                    size: "small"
                                  }),
                                  _cache[14] || (_cache[14] = _createElementVNode("span", null, "排除目录", -1)),
                                  _createVNode(_component_v_chip, {
                                    class: "ml-1",
                                    size: "x-small",
                                    color: "info",
                                    variant: "flat"
                                  }, {
                                    default: _withCtx(() => [
                                      _createTextVNode(_toDisplayString(_ctx.statusData.exclude_dirs?.length || 0) + " 个目录", 1)
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              _createVNode(_component_v_card_text, { class: "pa-0" }, {
                                default: _withCtx(() => [
                                  (!_ctx.statusData.exclude_dirs?.length)
                                    ? (_openBlock(), _createElementBlock("div", _hoisted_6, [
                                        _createVNode(_component_v_icon, {
                                          icon: "mdi-folder-off",
                                          size: "small",
                                          class: "mb-1"
                                        }),
                                        _cache[15] || (_cache[15] = _createElementVNode("div", { class: "text-caption" }, "未设置任何排除目录", -1))
                                      ]))
                                    : (_openBlock(), _createBlock(_component_v_list, {
                                        key: 1,
                                        class: "pa-0 bg-transparent",
                                        density: "compact"
                                      }, {
                                        default: _withCtx(() => [
                                          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.statusData.exclude_dirs, (path, index) => {
                                            return (_openBlock(), _createBlock(_component_v_list_item, {
                                              key: index,
                                              class: "px-3 py-1"
                                            }, {
                                              prepend: _withCtx(() => [
                                                _createVNode(_component_v_icon, {
                                                  icon: "mdi-folder-remove",
                                                  color: "error",
                                                  size: "small",
                                                  class: "mr-2"
                                                })
                                              ]),
                                              default: _withCtx(() => [
                                                _createVNode(_component_v_list_item_title, { class: "text-caption" }, {
                                                  default: _withCtx(() => [
                                                    _createTextVNode(_toDisplayString(path), 1)
                                                  ]),
                                                  _: 2
                                                }, 1024)
                                              ]),
                                              _: 2
                                            }, 1024))
                                          }), 128))
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
                  (_ctx.statusData.only_when_no_download)
                    ? (_openBlock(), _createBlock(_component_v_card, {
                        key: 0,
                        flat: "",
                        class: "rounded mb-3 border config-card"
                      }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_card_title, { class: "text-caption d-flex align-center justify-space-between px-3 py-2 bg-primary-lighten-5" }, {
                            default: _withCtx(() => [
                              _createElementVNode("div", _hoisted_7, [
                                _createVNode(_component_v_icon, {
                                  icon: "mdi-download-network",
                                  class: "mr-2",
                                  color: "primary",
                                  size: "small"
                                }),
                                _cache[16] || (_cache[16] = _createElementVNode("span", null, "下载器监控状态", -1))
                              ]),
                              _createVNode(_component_v_chip, {
                                size: "x-small",
                                color: _ctx.downloadersHaveActiveTasks ? 'warning' : 'success',
                                variant: "flat"
                              }, {
                                default: _withCtx(() => [
                                  _createTextVNode(_toDisplayString(_ctx.downloadersHaveActiveTasks ? '有活动任务' : '无活动任务'), 1)
                                ]),
                                _: 1
                              }, 8, ["color"])
                            ]),
                            _: 1
                          }),
                          _createVNode(_component_v_card_text, { class: "pa-0" }, {
                            default: _withCtx(() => [
                              (_ctx.loadingDownloaders)
                                ? (_openBlock(), _createElementBlock("div", _hoisted_8, [
                                    _createVNode(_component_v_progress_circular, {
                                      indeterminate: "",
                                      color: "primary",
                                      size: "24"
                                    })
                                  ]))
                                : (!_ctx.downloaders.length)
                                  ? (_openBlock(), _createElementBlock("div", _hoisted_9, [
                                      _createVNode(_component_v_icon, {
                                        icon: "mdi-download-off",
                                        size: "small",
                                        class: "mb-1"
                                      }),
                                      _cache[17] || (_cache[17] = _createElementVNode("div", { class: "text-caption" }, "未找到可用的下载器", -1))
                                    ]))
                                  : (_openBlock(), _createElementBlock("div", _hoisted_10, [
                                      _createElementVNode("div", _hoisted_11, [
                                        (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.downloaders, (downloader, index) => {
                                          return (_openBlock(), _createBlock(_component_v_card, {
                                            key: index,
                                            color: downloader.hasActiveTasks ? 'warning-lighten-5' : 'success-lighten-5',
                                            class: "downloader-card",
                                            flat: "",
                                            rounded: "",
                                            elevation: "0"
                                          }, {
                                            default: _withCtx(() => [
                                              _createElementVNode("div", _hoisted_12, [
                                                _createVNode(_component_v_avatar, {
                                                  size: "40",
                                                  color: downloader.hasActiveTasks ? 'warning-lighten-4' : 'success-lighten-4',
                                                  class: "mr-3"
                                                }, {
                                                  default: _withCtx(() => [
                                                    _createVNode(_component_v_icon, {
                                                      icon: downloader.hasActiveTasks ? 'mdi-download' : 'mdi-check-circle',
                                                      color: downloader.hasActiveTasks ? 'warning-darken-1' : 'success-darken-1'
                                                    }, null, 8, ["icon", "color"])
                                                  ]),
                                                  _: 2
                                                }, 1032, ["color"]),
                                                _createElementVNode("div", null, [
                                                  _createElementVNode("div", _hoisted_13, _toDisplayString(downloader.name), 1),
                                                  _createElementVNode("div", _hoisted_14, _toDisplayString(downloader.hasActiveTasks ? `${downloader.count || '0'} 个活动任务` : '空闲'), 1)
                                                ]),
                                                _createVNode(_component_v_spacer),
                                                _createVNode(_component_v_chip, {
                                                  size: "small",
                                                  color: downloader.hasActiveTasks ? 'warning' : 'success',
                                                  variant: "tonal",
                                                  class: "ml-2"
                                                }, {
                                                  default: _withCtx(() => [
                                                    _createTextVNode(_toDisplayString(downloader.hasActiveTasks ? '运行中' : '可清理'), 1)
                                                  ]),
                                                  _: 2
                                                }, 1032, ["color"])
                                              ]),
                                              (downloader.hasActiveTasks && downloader.activeTasks && downloader.activeTasks.length > 0)
                                                ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [
                                                    _createVNode(_component_v_divider),
                                                    _createVNode(_component_v_expansion_panels, {
                                                      variant: "accordion",
                                                      class: "mt-1"
                                                    }, {
                                                      default: _withCtx(() => [
                                                        _createVNode(_component_v_expansion_panel, null, {
                                                          default: _withCtx(() => [
                                                            _createVNode(_component_v_expansion_panel_title, {
                                                              class: "py-1 px-3",
                                                              density: "compact"
                                                            }, {
                                                              default: _withCtx(() => [
                                                                _createElementVNode("div", _hoisted_15, [
                                                                  _createVNode(_component_v_icon, {
                                                                    icon: "mdi-download-network",
                                                                    size: "small",
                                                                    class: "mr-1"
                                                                  }),
                                                                  _createElementVNode("span", null, "活动任务 (" + _toDisplayString(downloader.count) + ")", 1)
                                                                ])
                                                              ]),
                                                              _: 2
                                                            }, 1024),
                                                            _createVNode(_component_v_expansion_panel_text, { class: "py-1 px-0" }, {
                                                              default: _withCtx(() => [
                                                                _createElementVNode("div", _hoisted_16, [
                                                                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(downloader.activeTasks, (task, taskIndex) => {
                                                                    return (_openBlock(), _createElementBlock("div", {
                                                                      key: taskIndex,
                                                                      class: "task-item py-2 px-3"
                                                                    }, [
                                                                      _createElementVNode("div", _hoisted_17, [
                                                                        _createVNode(_component_v_icon, {
                                                                          icon: "mdi-download",
                                                                          size: "small",
                                                                          class: "mr-2",
                                                                          color: "warning"
                                                                        }),
                                                                        _createElementVNode("div", {
                                                                          class: "text-subtitle-2 text-truncate",
                                                                          title: task.name
                                                                        }, _toDisplayString(task.name), 9, _hoisted_18)
                                                                      ]),
                                                                      _createElementVNode("div", _hoisted_19, [
                                                                        _createVNode(_component_v_progress_linear, {
                                                                          modelValue: task.progress,
                                                                          "onUpdate:modelValue": $event => ((task.progress) = $event),
                                                                          color: "warning",
                                                                          height: "6",
                                                                          class: "rounded-lg flex-grow-1"
                                                                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                                                        _createElementVNode("span", _hoisted_20, _toDisplayString(task.progress.toFixed(1)) + "%", 1)
                                                                      ]),
                                                                      _createElementVNode("div", _hoisted_21, [
                                                                        _createElementVNode("span", _hoisted_22, [
                                                                          _createVNode(_component_v_icon, {
                                                                            icon: "mdi-speedometer",
                                                                            size: "x-small",
                                                                            class: "mr-1"
                                                                          }),
                                                                          _createTextVNode(" " + _toDisplayString(_ctx.formatSpeed(task.dlspeed)), 1)
                                                                        ]),
                                                                        _createElementVNode("span", _hoisted_23, [
                                                                          _createVNode(_component_v_icon, {
                                                                            icon: "mdi-clock-outline",
                                                                            size: "x-small",
                                                                            class: "mr-1"
                                                                          }),
                                                                          _createTextVNode(" " + _toDisplayString(_ctx.formatETA(task.eta)), 1)
                                                                        ]),
                                                                        _createElementVNode("span", _hoisted_24, [
                                                                          _createVNode(_component_v_icon, {
                                                                            icon: "mdi-harddisk",
                                                                            size: "x-small",
                                                                            class: "mr-1"
                                                                          }),
                                                                          _createTextVNode(" " + _toDisplayString(_ctx.formatSize(task.size)), 1)
                                                                        ])
                                                                      ])
                                                                    ]))
                                                                  }), 128))
                                                                ])
                                                              ]),
                                                              _: 2
                                                            }, 1024)
                                                          ]),
                                                          _: 2
                                                        }, 1024)
                                                      ]),
                                                      _: 2
                                                    }, 1024)
                                                  ], 64))
                                                : _createCommentVNode("", true)
                                            ]),
                                            _: 2
                                          }, 1032, ["color"]))
                                        }), 128))
                                      ])
                                    ]))
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }))
                    : _createCommentVNode("", true),
                  _createVNode(_component_v_card, {
                    flat: "",
                    class: "rounded mb-3 border config-card"
                  }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_card_title, { class: "text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_icon, {
                            icon: "mdi-filter-settings",
                            class: "mr-2",
                            color: "primary",
                            size: "small"
                          }),
                          _cache[18] || (_cache[18] = _createElementVNode("span", null, "清理规则", -1))
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
                                    color: _ctx.cleanupRules.empty_dir ? 'success' : 'grey',
                                    icon: "mdi-folder-remove",
                                    size: "small"
                                  }, null, 8, ["color"])
                                ]),
                                append: _withCtx(() => [
                                  _createVNode(_component_v_chip, {
                                    color: _ctx.cleanupRules.empty_dir ? 'success' : 'grey',
                                    size: "x-small",
                                    variant: "tonal"
                                  }, {
                                    default: _withCtx(() => [
                                      _createTextVNode(_toDisplayString(_ctx.cleanupRules.empty_dir ? '已启用' : '已禁用'), 1)
                                    ]),
                                    _: 1
                                  }, 8, ["color"])
                                ]),
                                default: _withCtx(() => [
                                  _createVNode(_component_v_list_item_title, { class: "text-caption" }, {
                                    default: _withCtx(() => _cache[19] || (_cache[19] = [
                                      _createTextVNode("清理空目录")
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
                                    color: _ctx.cleanupRules.small_dir.enabled ? 'warning' : 'grey',
                                    icon: "mdi-weight",
                                    size: "small"
                                  }, null, 8, ["color"])
                                ]),
                                append: _withCtx(() => [
                                  (_ctx.cleanupRules.small_dir.enabled)
                                    ? (_openBlock(), _createElementBlock("span", _hoisted_25, " 最大体积 " + _toDisplayString(_ctx.cleanupRules.small_dir.max_size) + "MB ", 1))
                                    : _createCommentVNode("", true),
                                  _createVNode(_component_v_chip, {
                                    color: _ctx.cleanupRules.small_dir.enabled ? 'warning' : 'grey',
                                    size: "x-small",
                                    variant: "tonal"
                                  }, {
                                    default: _withCtx(() => [
                                      _createTextVNode(_toDisplayString(_ctx.cleanupRules.small_dir.enabled ? '已启用' : '已禁用'), 1)
                                    ]),
                                    _: 1
                                  }, 8, ["color"])
                                ]),
                                default: _withCtx(() => [
                                  _createVNode(_component_v_list_item_title, { class: "text-caption" }, {
                                    default: _withCtx(() => _cache[20] || (_cache[20] = [
                                      _createTextVNode("清理小体积目录")
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
                                    color: _ctx.cleanupRules.size_reduction.enabled ? 'error' : 'grey',
                                    icon: "mdi-chart-line-variant",
                                    size: "small"
                                  }, null, 8, ["color"])
                                ]),
                                append: _withCtx(() => [
                                  (_ctx.cleanupRules.size_reduction.enabled)
                                    ? (_openBlock(), _createElementBlock("span", _hoisted_26, " 减少阈值 " + _toDisplayString(_ctx.cleanupRules.size_reduction.threshold) + "% ", 1))
                                    : _createCommentVNode("", true),
                                  _createVNode(_component_v_chip, {
                                    color: _ctx.cleanupRules.size_reduction.enabled ? 'error' : 'grey',
                                    size: "x-small",
                                    variant: "tonal"
                                  }, {
                                    default: _withCtx(() => [
                                      _createTextVNode(_toDisplayString(_ctx.cleanupRules.size_reduction.enabled ? '已启用' : '已禁用'), 1)
                                    ]),
                                    _: 1
                                  }, 8, ["color"])
                                ]),
                                default: _withCtx(() => [
                                  _createVNode(_component_v_list_item_title, { class: "text-caption" }, {
                                    default: _withCtx(() => _cache[21] || (_cache[21] = [
                                      _createTextVNode("清理体积减少目录")
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
                  }),
                  (_ctx.pathStats.length)
                    ? (_openBlock(), _createBlock(_component_v_card, {
                        key: 1,
                        flat: "",
                        class: "rounded mb-3 border config-card"
                      }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_card_title, { class: "text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_icon, {
                                icon: "mdi-chart-bar",
                                class: "mr-2",
                                color: "primary",
                                size: "small"
                              }),
                              _cache[22] || (_cache[22] = _createElementVNode("span", null, "目录统计", -1))
                            ]),
                            _: 1
                          }),
                          _createVNode(_component_v_card_text, { class: "pa-0" }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_table, {
                                density: "compact",
                                class: "text-body-2"
                              }, {
                                default: _withCtx(() => [
                                  _cache[23] || (_cache[23] = _createElementVNode("thead", null, [
                                    _createElementVNode("tr", null, [
                                      _createElementVNode("th", { class: "text-body-2 font-weight-bold" }, "路径"),
                                      _createElementVNode("th", { class: "text-body-2 font-weight-bold text-center" }, "总大小"),
                                      _createElementVNode("th", { class: "text-body-2 font-weight-bold text-center" }, "文件数"),
                                      _createElementVNode("th", { class: "text-body-2 font-weight-bold text-center" }, "子目录数")
                                    ])
                                  ], -1)),
                                  _createElementVNode("tbody", null, [
                                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.validPathStats, (path, index) => {
                                      return (_openBlock(), _createElementBlock("tr", { key: index }, [
                                        _createElementVNode("td", null, [
                                          _createElementVNode("div", _hoisted_27, [
                                            _createVNode(_component_v_icon, {
                                              icon: "mdi-folder",
                                              size: "small",
                                              color: "amber-darken-2",
                                              class: "mr-2"
                                            }),
                                            _createElementVNode("span", _hoisted_28, _toDisplayString(path.path), 1)
                                          ])
                                        ]),
                                        _createElementVNode("td", _hoisted_29, _toDisplayString(_ctx.formatSize(path.total_size_bytes)), 1),
                                        _createElementVNode("td", _hoisted_30, _toDisplayString(path.file_count), 1),
                                        _createElementVNode("td", _hoisted_31, _toDisplayString(path.dir_count), 1)
                                      ]))
                                    }), 128))
                                  ])
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }))
                    : _createCommentVNode("", true),
                  (_ctx.cleanResult)
                    ? (_openBlock(), _createBlock(_component_v_card, {
                        key: 2,
                        flat: "",
                        class: "rounded mb-3 border config-card"
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
                              _cache[24] || (_cache[24] = _createElementVNode("span", null, "最近清理记录", -1)),
                              _createVNode(_component_v_chip, {
                                size: "x-small",
                                color: "success",
                                variant: "flat",
                                class: "ml-2"
                              }, {
                                default: _withCtx(() => [
                                  _createTextVNode(_toDisplayString(_ctx.formatDate(new Date())), 1)
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          _createVNode(_component_v_card_text, { class: "pa-0" }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_alert, {
                                type: _ctx.cleanResult.status === 'success' ? 'success' : 'error',
                                variant: "tonal",
                                density: "compact",
                                class: "ma-2"
                              }, {
                                default: _withCtx(() => [
                                  _createTextVNode(_toDisplayString(_ctx.cleanResult.status === 'success' ? 
                  `清理成功，共删除 ${_ctx.cleanResult.removed_dirs.length} 个目录，释放 ${_ctx.cleanResult.total_freed_space.toFixed(2)}MB 空间` : 
                  _ctx.cleanResult.message || '清理失败'), 1)
                                ]),
                                _: 1
                              }, 8, ["type"]),
                              (_ctx.cleanResult.status === 'success' && _ctx.cleanResult.removed_dirs.length)
                                ? (_openBlock(), _createElementBlock("div", _hoisted_32, [
                                    _createVNode(_component_v_card, {
                                      flat: "",
                                      class: "ma-2 px-2 py-1 bg-grey-lighten-5"
                                    }, {
                                      default: _withCtx(() => [
                                        _createElementVNode("div", _hoisted_33, [
                                          _createVNode(_component_v_icon, {
                                            icon: "mdi-information-outline",
                                            size: "small",
                                            color: "info",
                                            class: "mr-2"
                                          }),
                                          _createElementVNode("span", _hoisted_34, "按类型统计：空目录(" + _toDisplayString(_ctx.cleanResult.removed_empty_dirs_count) + ")、小体积目录(" + _toDisplayString(_ctx.cleanResult.removed_small_dirs_count) + ")、体积减少目录(" + _toDisplayString(_ctx.cleanResult.removed_size_reduction_dirs_count) + ")", 1)
                                        ])
                                      ]),
                                      _: 1
                                    }),
                                    _cache[25] || (_cache[25] = _createElementVNode("div", { class: "my-2 px-3" }, [
                                      _createElementVNode("div", { class: "text-subtitle-2 font-weight-medium" }, "已删除的目录：")
                                    ], -1)),
                                    _createVNode(_component_v_list, {
                                      density: "compact",
                                      class: "pa-0"
                                    }, {
                                      default: _withCtx(() => [
                                        (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.cleanResult.removed_dirs, (dir, index) => {
                                          return (_openBlock(), _createBlock(_component_v_list_item, {
                                            key: index,
                                            class: "clean-history-item"
                                          }, {
                                            prepend: _withCtx(() => [
                                              _createVNode(_component_v_avatar, {
                                                color: _ctx.getCleanTypeColor(dir.type) + '-lighten-4',
                                                size: "28",
                                                class: "mr-2"
                                              }, {
                                                default: _withCtx(() => [
                                                  _createVNode(_component_v_icon, {
                                                    icon: _ctx.getCleanTypeIcon(dir.type),
                                                    size: "small",
                                                    color: _ctx.getCleanTypeColor(dir.type)
                                                  }, null, 8, ["icon", "color"])
                                                ]),
                                                _: 2
                                              }, 1032, ["color"])
                                            ]),
                                            append: _withCtx(() => [
                                              _createElementVNode("div", _hoisted_35, [
                                                (dir.type === 'small')
                                                  ? (_openBlock(), _createElementBlock("span", _hoisted_36, _toDisplayString(dir.size.toFixed(2)) + "MB", 1))
                                                  : _createCommentVNode("", true),
                                                (dir.type === 'size_reduction')
                                                  ? (_openBlock(), _createElementBlock("span", _hoisted_37, "减少" + _toDisplayString(dir.reduction_percent.toFixed(0)) + "%", 1))
                                                  : _createCommentVNode("", true),
                                                _createVNode(_component_v_chip, {
                                                  size: "x-small",
                                                  color: _ctx.getCleanTypeColor(dir.type),
                                                  variant: "flat",
                                                  class: "clean-type-chip"
                                                }, {
                                                  default: _withCtx(() => [
                                                    _createTextVNode(_toDisplayString(_ctx.getCleanTypeText(dir.type)), 1)
                                                  ]),
                                                  _: 2
                                                }, 1032, ["color"])
                                              ])
                                            ]),
                                            default: _withCtx(() => [
                                              _createVNode(_component_v_list_item_title, { class: "text-body-2 clean-dir-path" }, {
                                                default: _withCtx(() => [
                                                  _createTextVNode(_toDisplayString(dir.path), 1)
                                                ]),
                                                _: 2
                                              }, 1024)
                                            ]),
                                            _: 2
                                          }, 1024))
                                        }), 128))
                                      ]),
                                      _: 1
                                    })
                                  ]))
                                : (_ctx.cleanResult.status === 'success' && _ctx.cleanResult.removed_dirs.length === 0)
                                  ? (_openBlock(), _createElementBlock("div", _hoisted_38, [
                                      _createVNode(_component_v_icon, {
                                        icon: "mdi-information-outline",
                                        size: "large",
                                        color: "info",
                                        class: "mb-2"
                                      }),
                                      _cache[26] || (_cache[26] = _createElementVNode("div", null, "没有符合清理条件的目录", -1))
                                    ]))
                                  : _createCommentVNode("", true)
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }))
                    : _createCommentVNode("", true),
                  _createVNode(_component_v_card, {
                    flat: "",
                    class: "rounded mb-3 border config-card"
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
                          _cache[27] || (_cache[27] = _createElementVNode("span", null, "清理历史", -1))
                        ]),
                        _: 1
                      }),
                      _createVNode(_component_v_card_text, { class: "px-3 py-2" }, {
                        default: _withCtx(() => [
                          (!_ctx.cleanHistory.length)
                            ? (_openBlock(), _createElementBlock("div", _hoisted_39, [
                                _createVNode(_component_v_icon, {
                                  icon: "mdi-information-outline",
                                  size: "small",
                                  class: "mb-1"
                                }),
                                _cache[28] || (_cache[28] = _createElementVNode("div", { class: "text-caption" }, "暂无清理历史记录", -1))
                              ]))
                            : (_openBlock(), _createBlock(_component_v_timeline, {
                                key: 1,
                                density: "compact",
                                align: "start",
                                "truncate-line": "both",
                                class: "mt-0"
                              }, {
                                default: _withCtx(() => [
                                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.cleanHistory.slice(0, 3), (item, index) => {
                                    return (_openBlock(), _createBlock(_component_v_timeline_item, {
                                      key: index,
                                      "dot-color": _ctx.getHistoryColor(index),
                                      size: "x-small"
                                    }, {
                                      icon: _withCtx(() => [
                                        _createVNode(_component_v_icon, { size: "x-small" }, {
                                          default: _withCtx(() => _cache[29] || (_cache[29] = [
                                            _createTextVNode("mdi-broom")
                                          ])),
                                          _: 1
                                        })
                                      ]),
                                      default: _withCtx(() => [
                                        _createElementVNode("div", _hoisted_40, [
                                          _createElementVNode("span", _hoisted_41, _toDisplayString(_ctx.formatDate(new Date(item.last_update))), 1),
                                          _createVNode(_component_v_chip, {
                                            size: "x-small",
                                            color: _ctx.getHistoryColor(index),
                                            variant: "flat"
                                          }, {
                                            default: _withCtx(() => [
                                              _createTextVNode(" #" + _toDisplayString(index + 1), 1)
                                            ]),
                                            _: 2
                                          }, 1032, ["color"])
                                        ]),
                                        _createElementVNode("div", _hoisted_42, [
                                          _cache[30] || (_cache[30] = _createTextVNode(" 清理 ")),
                                          _createElementVNode("strong", null, _toDisplayString(item.removed_dirs.length), 1),
                                          _createTextVNode(" 个目录 (释放 " + _toDisplayString(item.total_freed_space.toFixed(2)) + "MB) ", 1)
                                        ])
                                      ]),
                                      _: 2
                                    }, 1032, ["dot-color"]))
                                  }), 128)),
                                  (_ctx.cleanHistory.length > 3)
                                    ? (_openBlock(), _createBlock(_component_v_timeline_item, {
                                        key: 0,
                                        "dot-color": "primary",
                                        size: "x-small"
                                      }, {
                                        icon: _withCtx(() => [
                                          _createVNode(_component_v_icon, { size: "x-small" }, {
                                            default: _withCtx(() => _cache[31] || (_cache[31] = [
                                              _createTextVNode("mdi-dots-horizontal")
                                            ])),
                                            _: 1
                                          })
                                        ]),
                                        default: _withCtx(() => [
                                          _createElementVNode("div", _hoisted_43, [
                                            _createElementVNode("span", _hoisted_44, "还有 " + _toDisplayString(_ctx.cleanHistory.length - 3) + " 条历史记录", 1),
                                            _createVNode(_component_v_btn, {
                                              variant: "text",
                                              density: "comfortable",
                                              size: "x-small",
                                              color: "primary",
                                              class: "ml-2",
                                              onClick: _cache[0] || (_cache[0] = $event => (_ctx.showHistoryDialog = true))
                                            }, {
                                              default: _withCtx(() => _cache[32] || (_cache[32] = [
                                                _createTextVNode(" 查看更多 ")
                                              ])),
                                              _: 1
                                            })
                                          ])
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
                  }),
                  _createVNode(_component_v_card, {
                    flat: "",
                    class: "rounded mb-3 border config-card"
                  }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_card_text, { class: "d-flex align-center px-3 py-2" }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_icon, {
                            icon: "mdi-information",
                            color: "info",
                            class: "mr-2",
                            size: "small"
                          }),
                          _cache[33] || (_cache[33] = _createElementVNode("span", { class: "text-caption" }, " 点击\"配置\"按钮可设置清理策略和监控目录。点击\"立即清理\"按钮可立即执行清理任务。 ", -1))
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
              color: "info",
              onClick: _ctx.refreshData,
              "prepend-icon": "mdi-refresh",
              disabled: _ctx.refreshing,
              loading: _ctx.refreshing,
              variant: "text",
              size: "small"
            }, {
              default: _withCtx(() => _cache[34] || (_cache[34] = [
                _createTextVNode("刷新数据")
              ])),
              _: 1
            }, 8, ["onClick", "disabled", "loading"]),
            _createVNode(_component_v_spacer),
            _createVNode(_component_v_btn, {
              color: "success",
              onClick: _ctx.triggerClean,
              loading: _ctx.actionLoading,
              disabled: _ctx.actionLoading,
              "prepend-icon": "mdi-broom",
              variant: "text",
              size: "small"
            }, {
              default: _withCtx(() => _cache[35] || (_cache[35] = [
                _createTextVNode(" 立即清理 ")
              ])),
              _: 1
            }, 8, ["onClick", "loading", "disabled"]),
            _createVNode(_component_v_btn, {
              color: "primary",
              onClick: _cache[1] || (_cache[1] = $event => (_ctx.emit('switch'))),
              "prepend-icon": "mdi-cog",
              variant: "text",
              size: "small"
            }, {
              default: _withCtx(() => _cache[36] || (_cache[36] = [
                _createTextVNode("配置")
              ])),
              _: 1
            }),
            _createVNode(_component_v_btn, {
              color: "grey",
              onClick: _cache[2] || (_cache[2] = $event => (_ctx.emit('close'))),
              "prepend-icon": "mdi-close",
              variant: "text",
              size: "small"
            }, {
              default: _withCtx(() => _cache[37] || (_cache[37] = [
                _createTextVNode("关闭")
              ])),
              _: 1
            })
          ]),
          _: 1
        })
      ]),
      _: 1
    }),
    _createVNode(_component_v_dialog, {
      modelValue: _ctx.showCleanResultDialog,
      "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => ((_ctx.showCleanResultDialog) = $event)),
      "max-width": "600"
    }, {
      default: _withCtx(() => [
        _createVNode(_component_v_card, null, {
          default: _withCtx(() => [
            _createVNode(_component_v_card_title, { class: "text-subtitle-1 d-flex align-center px-3 py-2 bg-primary-lighten-5" }, {
              default: _withCtx(() => [
                _createVNode(_component_v_icon, {
                  icon: "mdi-broom",
                  class: "mr-2",
                  color: "primary"
                }),
                _cache[38] || (_cache[38] = _createElementVNode("span", null, "清理结果", -1))
              ]),
              _: 1
            }),
            _createVNode(_component_v_card_text, { class: "px-3 py-2" }, {
              default: _withCtx(() => [
                (_ctx.cleanResult)
                  ? (_openBlock(), _createElementBlock("div", _hoisted_45, [
                      _createVNode(_component_v_alert, {
                        type: _ctx.cleanResult.status === 'success' ? 'success' : 'error',
                        variant: "tonal",
                        density: "compact",
                        class: "mb-3"
                      }, {
                        default: _withCtx(() => [
                          _createTextVNode(_toDisplayString(_ctx.cleanResult.status === 'success' ? 
                `清理成功，共删除 ${_ctx.cleanResult.removed_dirs.length} 个目录，释放 ${_ctx.cleanResult.total_freed_space.toFixed(2)}MB 空间` : 
                _ctx.cleanResult.message || '清理失败'), 1)
                        ]),
                        _: 1
                      }, 8, ["type"]),
                      (_ctx.cleanResult.status === 'success' && _ctx.cleanResult.removed_dirs.length)
                        ? (_openBlock(), _createElementBlock("div", _hoisted_46, [
                            _cache[39] || (_cache[39] = _createElementVNode("div", { class: "text-subtitle-2 mb-2" }, "已删除的目录：", -1)),
                            _createVNode(_component_v_list, {
                              density: "compact",
                              class: "bg-grey-lighten-5 rounded"
                            }, {
                              default: _withCtx(() => [
                                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.cleanResult.removed_dirs, (dir, index) => {
                                  return (_openBlock(), _createBlock(_component_v_list_item, {
                                    key: index,
                                    class: "py-1"
                                  }, {
                                    prepend: _withCtx(() => [
                                      _createVNode(_component_v_icon, {
                                        icon: "mdi-folder-remove",
                                        size: "small",
                                        color: _ctx.getCleanTypeColor(dir.type),
                                        class: "mr-2"
                                      }, null, 8, ["color"])
                                    ]),
                                    append: _withCtx(() => [
                                      _createVNode(_component_v_chip, {
                                        size: "x-small",
                                        color: _ctx.getCleanTypeColor(dir.type),
                                        variant: "flat"
                                      }, {
                                        default: _withCtx(() => [
                                          _createTextVNode(_toDisplayString(_ctx.getCleanTypeText(dir.type)) + " " + _toDisplayString(dir.type === 'size_reduction' ? `(${dir.reduction_percent.toFixed(0)}%)` : 
                         dir.type === 'small' ? `(${dir.size.toFixed(2)}MB)` : ''), 1)
                                        ]),
                                        _: 2
                                      }, 1032, ["color"])
                                    ]),
                                    default: _withCtx(() => [
                                      _createVNode(_component_v_list_item_title, { class: "text-caption" }, {
                                        default: _withCtx(() => [
                                          _createTextVNode(_toDisplayString(dir.path), 1)
                                        ]),
                                        _: 2
                                      }, 1024)
                                    ]),
                                    _: 2
                                  }, 1024))
                                }), 128))
                              ]),
                              _: 1
                            })
                          ]))
                        : _createCommentVNode("", true),
                      (_ctx.cleanResult.status === 'success' && _ctx.cleanResult.removed_dirs.length === 0)
                        ? (_openBlock(), _createElementBlock("div", _hoisted_47, [
                            _createVNode(_component_v_icon, {
                              icon: "mdi-information-outline",
                              size: "large",
                              color: "info",
                              class: "mb-2"
                            }),
                            _cache[40] || (_cache[40] = _createElementVNode("div", null, "没有符合清理条件的目录", -1))
                          ]))
                        : _createCommentVNode("", true)
                    ]))
                  : _createCommentVNode("", true)
              ]),
              _: 1
            }),
            _createVNode(_component_v_card_actions, { class: "px-3 py-2" }, {
              default: _withCtx(() => [
                _createVNode(_component_v_spacer),
                _createVNode(_component_v_btn, {
                  color: "primary",
                  variant: "text",
                  onClick: _cache[3] || (_cache[3] = $event => (_ctx.showCleanResultDialog = false))
                }, {
                  default: _withCtx(() => _cache[41] || (_cache[41] = [
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
      ]),
      _: 1
    }, 8, ["modelValue"]),
    _createVNode(_component_v_dialog, {
      modelValue: _ctx.showHistoryDialog,
      "onUpdate:modelValue": _cache[6] || (_cache[6] = $event => ((_ctx.showHistoryDialog) = $event)),
      "max-width": "600px"
    }, {
      default: _withCtx(() => [
        _createVNode(_component_v_card, null, {
          default: _withCtx(() => [
            _createVNode(_component_v_card_title, { class: "text-subtitle-1 d-flex align-center px-4 py-3 bg-primary-lighten-5" }, {
              default: _withCtx(() => [
                _createVNode(_component_v_icon, {
                  icon: "mdi-history",
                  class: "mr-2",
                  color: "primary"
                }),
                _cache[42] || (_cache[42] = _createElementVNode("span", null, "清理历史记录", -1))
              ]),
              _: 1
            }),
            _createVNode(_component_v_card_text, { class: "pa-4" }, {
              default: _withCtx(() => [
                (_ctx.cleanHistory.length)
                  ? (_openBlock(), _createBlock(_component_v_timeline, {
                      key: 0,
                      density: "compact",
                      align: "start"
                    }, {
                      default: _withCtx(() => [
                        (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.cleanHistory, (item, index) => {
                          return (_openBlock(), _createBlock(_component_v_timeline_item, {
                            key: index,
                            "dot-color": _ctx.getHistoryColor(index),
                            size: "small"
                          }, {
                            icon: _withCtx(() => [
                              _createVNode(_component_v_icon, { size: "x-small" }, {
                                default: _withCtx(() => _cache[43] || (_cache[43] = [
                                  _createTextVNode("mdi-broom")
                                ])),
                                _: 1
                              })
                            ]),
                            default: _withCtx(() => [
                              _createElementVNode("div", _hoisted_48, [
                                _createElementVNode("span", _hoisted_49, _toDisplayString(_ctx.formatDate(new Date(item.last_update))), 1),
                                _createVNode(_component_v_chip, {
                                  size: "x-small",
                                  color: _ctx.getHistoryColor(index),
                                  variant: "flat"
                                }, {
                                  default: _withCtx(() => [
                                    _createTextVNode(" #" + _toDisplayString(index + 1), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["color"])
                              ]),
                              _createElementVNode("div", _hoisted_50, [
                                _cache[44] || (_cache[44] = _createTextVNode(" 清理 ")),
                                _createElementVNode("strong", null, _toDisplayString(item.removed_dirs.length), 1),
                                _createTextVNode(" 个目录 (释放 " + _toDisplayString(item.total_freed_space.toFixed(2)) + "MB 空间) ", 1)
                              ]),
                              _createElementVNode("div", _hoisted_51, [
                                _createVNode(_component_v_chip, {
                                  size: "x-small",
                                  color: "success",
                                  variant: "flat",
                                  class: "mr-1 mb-1"
                                }, {
                                  default: _withCtx(() => [
                                    _createTextVNode(" 空目录: " + _toDisplayString(item.removed_empty_dirs_count), 1)
                                  ]),
                                  _: 2
                                }, 1024),
                                _createVNode(_component_v_chip, {
                                  size: "x-small",
                                  color: "warning",
                                  variant: "flat",
                                  class: "mr-1 mb-1"
                                }, {
                                  default: _withCtx(() => [
                                    _createTextVNode(" 小体积目录: " + _toDisplayString(item.removed_small_dirs_count), 1)
                                  ]),
                                  _: 2
                                }, 1024),
                                _createVNode(_component_v_chip, {
                                  size: "x-small",
                                  color: "error",
                                  variant: "flat",
                                  class: "mb-1"
                                }, {
                                  default: _withCtx(() => [
                                    _createTextVNode(" 体积减少目录: " + _toDisplayString(item.removed_size_reduction_dirs_count), 1)
                                  ]),
                                  _: 2
                                }, 1024)
                              ])
                            ]),
                            _: 2
                          }, 1032, ["dot-color"]))
                        }), 128))
                      ]),
                      _: 1
                    }))
                  : (_openBlock(), _createElementBlock("div", _hoisted_52, [
                      _createVNode(_component_v_icon, {
                        icon: "mdi-information-outline",
                        color: "grey",
                        class: "mr-2"
                      }),
                      _cache[45] || (_cache[45] = _createElementVNode("span", { class: "text-grey" }, "暂无清理历史记录", -1))
                    ]))
              ]),
              _: 1
            }),
            _createVNode(_component_v_card_actions, { class: "px-4 py-3" }, {
              default: _withCtx(() => [
                _createVNode(_component_v_spacer),
                _createVNode(_component_v_btn, {
                  variant: "text",
                  color: "primary",
                  onClick: _cache[5] || (_cache[5] = $event => (_ctx.showHistoryDialog = false))
                }, {
                  default: _withCtx(() => _cache[46] || (_cache[46] = [
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
      ]),
      _: 1
    }, 8, ["modelValue"])
  ]))
}
const Page = /*#__PURE__*/_export_sfc(_sfc_main, [['render',_sfc_render]]);

export { Page as default };
