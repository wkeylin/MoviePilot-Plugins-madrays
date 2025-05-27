import { importShared } from './__federation_fn_import-JrT3xvdd.js';

const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

const {resolveComponent:_resolveComponent,createVNode:_createVNode,createElementVNode:_createElementVNode,createTextVNode:_createTextVNode,mergeProps:_mergeProps,withCtx:_withCtx,renderList:_renderList,Fragment:_Fragment,openBlock:_openBlock,createElementBlock:_createElementBlock,createBlock:_createBlock,createCommentVNode:_createCommentVNode,toDisplayString:_toDisplayString,normalizeClass:_normalizeClass} = await importShared('vue');


const _hoisted_1 = { class: "plugin-manager" };
const _hoisted_2 = { class: "control-panel" };
const _hoisted_3 = { class: "panel-left" };
const _hoisted_4 = { class: "search-container" };
const _hoisted_5 = { class: "panel-right" };
const _hoisted_6 = { class: "quick-reload-grid" };
const _hoisted_7 = { class: "status-grid" };
const _hoisted_8 = { class: "status-indicator" };
const _hoisted_9 = { class: "status-data" };
const _hoisted_10 = { class: "status-value" };
const _hoisted_11 = { class: "status-label" };
const _hoisted_12 = {
  key: 1,
  class: "loading-panel"
};
const _hoisted_13 = { class: "loading-content" };
const _hoisted_14 = {
  key: 2,
  class: "error-panel"
};
const _hoisted_15 = { class: "error-message" };
const _hoisted_16 = {
  key: 3,
  class: "empty-panel"
};
const _hoisted_17 = { class: "empty-title" };
const _hoisted_18 = { class: "empty-subtitle" };
const _hoisted_19 = {
  key: 4,
  class: "plugin-matrix"
};
const _hoisted_20 = { class: "module-header" };
const _hoisted_21 = { class: "module-avatar" };
const _hoisted_22 = { class: "module-info" };
const _hoisted_23 = { class: "module-name" };
const _hoisted_24 = { class: "module-meta" };
const _hoisted_25 = { class: "module-status" };
const _hoisted_26 = { class: "module-tags" };
const _hoisted_27 = { class: "module-controls" };
const _hoisted_28 = {
  key: 0,
  class: "module-overlay"
};
const _hoisted_29 = { class: "action-dialog" };
const _hoisted_30 = { class: "dialog-header" };
const _hoisted_31 = { class: "dialog-title" };
const _hoisted_32 = { class: "dialog-content" };
const _hoisted_33 = { class: "target-info" };
const _hoisted_34 = { class: "target-name" };
const _hoisted_35 = { class: "target-meta" };
const _hoisted_36 = { class: "option-list" };
const _hoisted_37 = { class: "dialog-actions" };

const {ref,computed,onMounted} = await importShared('vue');

  
  // Props
  const pluginId = "PluginManagerVue";
  
  // 计算属性
  
const _sfc_main = {
  __name: 'Page',
  props: {
    api: {
      type: [Object, Function],
      required: true,
    }
  },
  emits: ['close'],
  setup(__props, { emit: __emit }) {

  const props = __props;
  
  // Emits
  const emit = __emit;
  
  // 响应式数据
  const loading = ref(false);
  const error = ref(null);
  const dataLoaded = ref(false);
  const searchQuery = ref('');
  const globalMessage = ref(null);
  const globalMessageType = ref('info');
  const actionDialog = ref(false);
  const selectedPlugin = ref(null);
  const clearConfig = ref(false);
  const clearData = ref(false);
  const forceClean = ref(false);
  const actionLoading = ref(false);
  
  // 快速重载相关
  const quickReloadLoading = ref(false);
  const lastReloadPlugins = ref([]);
  
  // 插件数据
  const plugins = ref([]);
  const reloadingPlugins = ref(new Set());
  
  // 插件ID
  const filteredPlugins = computed(() => {
    if (!searchQuery.value) {
      return plugins.value;
    }
    
    const query = searchQuery.value.toLowerCase();
    return plugins.value.filter(plugin => 
      plugin.name.toLowerCase().includes(query) ||
      plugin.id.toLowerCase().includes(query) ||
      plugin.author.toLowerCase().includes(query) ||
      plugin.desc.toLowerCase().includes(query)
    );
  });
  
  const statusStats = computed(() => [
    {
      icon: 'mdi-package-variant',
      value: plugins.value.length,
      label: '总数'
    },
    {
      icon: 'mdi-check-circle',
      value: plugins.value.filter(p => p.installed).length,
      label: '已装'
    },
    {
      icon: 'mdi-play-circle',
      value: plugins.value.filter(p => p.running).length,
      label: '运行'
    },
    {
      icon: 'mdi-cloud',
      value: plugins.value.filter(p => p.type !== 'local').length,
      label: '在线'
    },
    {
      icon: 'mdi-folder',
      value: plugins.value.filter(p => p.type === 'local').length,
      label: '本地'
    }
  ]);
  
  // 方法
  function getStatusColor(plugin) {
  if (plugin.running) return 'success';
  if (plugin.installed) return 'primary';
  return 'grey';
}

function getStatusText(plugin) {
  if (plugin.running) return '运行中';
  if (plugin.installed) return '已安装';
  return '未安装';
}

function getStatusClass(plugin) {
  if (plugin.running) return 'dot-active';
  if (plugin.installed) return 'dot-ready';
  return 'dot-offline';
}
  
  function handleImageError(event) {
    if (event?.target?.src) {
      console.warn('插件图标加载失败:', event.target.src);
    }
  }
  
  function showMessage(message, type = 'info') {
    globalMessage.value = message;
    globalMessageType.value = type;
    
    setTimeout(() => {
      clearMessage();
    }, 5000);
  }
  
  function clearMessage() {
    globalMessage.value = null;
  }
  
  async function fetchPlugins() {
    loading.value = true;
    error.value = null;
  
    try {
      const response = await props.api.get(`plugin/${pluginId}/plugins`);
      
      if (response?.success) {
        plugins.value = response.data || [];
        dataLoaded.value = true;
      } else {
        throw new Error(response?.message || '获取插件列表失败');
      }
    } catch (err) {
      console.error('获取插件列表失败:', err);
      error.value = err.message || '获取插件列表失败';
    } finally {
      loading.value = false;
    }
  }
  
  async function refreshPlugins() {
    await fetchPlugins();
    await fetchLastReload();
  }
  
  async function reloadPlugin(plugin) {
    if (reloadingPlugins.value.has(plugin.id)) {
      return;
    }
  
    reloadingPlugins.value.add(plugin.id);
  
    try {
      const response = await props.api.post(`plugin/${pluginId}/reload`, {
        plugin_id: plugin.id
      });
  
      if (response?.success) {
        showMessage(`${plugin.name} 重载成功`, 'success');
        
        // 延迟刷新数据
        setTimeout(() => {
          refreshPlugins();
        }, 1000);
      } else {
        throw new Error(response?.message || '重载失败');
      }
    } catch (err) {
      console.error('重载插件失败:', err);
      showMessage(`${plugin.name} 重载失败: ${err.message}`, 'error');
    } finally {
      reloadingPlugins.value.delete(plugin.id);
    }
  }
  
  async function reloadAllRecent() {
    if (lastReloadPlugins.value.length === 0) return;
    
    quickReloadLoading.value = true;
    let successCount = 0;
    let failCount = 0;
    
    for (const plugin of lastReloadPlugins.value) {
      try {
        const response = await props.api.post(`plugin/${pluginId}/reload`, {
          plugin_id: plugin.id
        });
        
        if (response?.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error(`重载插件 ${plugin.id} 失败:`, err);
        failCount++;
      }
    }
    
    quickReloadLoading.value = false;
    
    if (failCount === 0) {
      showMessage(`成功重载 ${successCount} 个插件`, 'success');
    } else {
      showMessage(`重载完成：成功 ${successCount} 个，失败 ${failCount} 个`, 'warning');
    }
    
    setTimeout(() => {
      refreshPlugins();
    }, 1000);
  }
  
  function showActionDialog(plugin) {
    selectedPlugin.value = plugin;
    clearConfig.value = false;
    clearData.value = false;
    forceClean.value = false;
    actionDialog.value = true;
  }
  
  async function confirmAction() {
    if (!selectedPlugin.value) return;
    
    actionLoading.value = true;
    
    try {
      const response = await props.api.post(`plugin/${pluginId}/uninstall`, {
        plugin_id: selectedPlugin.value.id,
        clear_config: clearConfig.value,
        clear_data: clearData.value,
        force_clean: forceClean.value
      });
  
      if (response?.success) {
        const action = selectedPlugin.value.installed ? '卸载' : '清理';
        showMessage(`${selectedPlugin.value.name} ${action}成功`, 'success');
        
        // 立即刷新数据
        setTimeout(() => {
          refreshPlugins();
        }, 1000);
      } else {
        throw new Error(response?.message || '操作失败');
      }
    } catch (err) {
      console.error('操作失败:', err);
      showMessage(`操作失败: ${err.message}`, 'error');
    } finally {
      actionLoading.value = false;
      actionDialog.value = false;
      selectedPlugin.value = null;
    }
  }
  
  async function fetchLastReload() {
    try {
      const response = await props.api.get(`plugin/${pluginId}/last_reload`);
      if (response?.success) {
        lastReloadPlugins.value = response.data || [];
      }
    } catch (err) {
      console.error('获取上次重载插件失败:', err);
    }
  }
  
  // 组件挂载
  onMounted(() => {
    fetchPlugins();
    fetchLastReload();
  });
  
return (_ctx, _cache) => {
  const _component_v_text_field = _resolveComponent("v-text-field");
  const _component_v_badge = _resolveComponent("v-badge");
  const _component_v_btn = _resolveComponent("v-btn");
  const _component_v_icon = _resolveComponent("v-icon");
  const _component_v_img = _resolveComponent("v-img");
  const _component_v_avatar = _resolveComponent("v-avatar");
  const _component_v_divider = _resolveComponent("v-divider");
  const _component_v_card_text = _resolveComponent("v-card-text");
  const _component_v_card = _resolveComponent("v-card");
  const _component_v_menu = _resolveComponent("v-menu");
  const _component_v_alert = _resolveComponent("v-alert");
  const _component_v_progress_circular = _resolveComponent("v-progress-circular");
  const _component_v_chip = _resolveComponent("v-chip");
  const _component_v_checkbox = _resolveComponent("v-checkbox");
  const _component_v_dialog = _resolveComponent("v-dialog");

  return (_openBlock(), _createElementBlock("div", _hoisted_1, [
    _createElementVNode("div", _hoisted_2, [
      _createElementVNode("div", _hoisted_3, [
        _createElementVNode("div", _hoisted_4, [
          _createVNode(_component_v_text_field, {
            modelValue: searchQuery.value,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((searchQuery).value = $event)),
            "prepend-inner-icon": "mdi-magnify",
            placeholder: "搜索插件...",
            variant: "outlined",
            density: "compact",
            "hide-details": "",
            clearable: "",
            class: "search-field"
          }, null, 8, ["modelValue"])
        ])
      ]),
      _createElementVNode("div", _hoisted_5, [
        (lastReloadPlugins.value.length > 0)
          ? (_openBlock(), _createBlock(_component_v_menu, {
              key: 0,
              "offset-y": ""
            }, {
              activator: _withCtx(({ props }) => [
                _createVNode(_component_v_btn, _mergeProps(props, {
                  variant: "outlined",
                  size: "small",
                  class: "control-btn quick-reload-btn",
                  "prepend-icon": "mdi-lightning-bolt"
                }), {
                  default: _withCtx(() => [
                    _cache[7] || (_cache[7] = _createTextVNode(" 快速重载 ")),
                    _createVNode(_component_v_badge, {
                      content: lastReloadPlugins.value.length,
                      color: "warning",
                      inline: ""
                    }, null, 8, ["content"])
                  ]),
                  _: 2,
                  __: [7]
                }, 1040)
              ]),
              default: _withCtx(() => [
                _createVNode(_component_v_card, {
                  class: "quick-reload-menu",
                  elevation: "8"
                }, {
                  default: _withCtx(() => [
                    _createVNode(_component_v_card_text, { class: "pa-2" }, {
                      default: _withCtx(() => [
                        _cache[11] || (_cache[11] = _createElementVNode("div", { class: "text-caption mb-2 text-center" }, "最近重载的插件", -1)),
                        _createElementVNode("div", _hoisted_6, [
                          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(lastReloadPlugins.value.slice(0, 6), (plugin) => {
                            return (_openBlock(), _createBlock(_component_v_btn, {
                              key: plugin.id,
                              size: "x-small",
                              variant: "text",
                              class: "quick-reload-item",
                              onClick: $event => (reloadPlugin(plugin)),
                              loading: reloadingPlugins.value.has(plugin.id)
                            }, {
                              default: _withCtx(() => [
                                _createVNode(_component_v_avatar, {
                                  size: "16",
                                  class: "mr-1"
                                }, {
                                  default: _withCtx(() => [
                                    (plugin.icon)
                                      ? (_openBlock(), _createBlock(_component_v_img, {
                                          key: 0,
                                          src: plugin.icon
                                        }, {
                                          placeholder: _withCtx(() => [
                                            _createVNode(_component_v_icon, { size: "12" }, {
                                              default: _withCtx(() => _cache[8] || (_cache[8] = [
                                                _createTextVNode("mdi-puzzle")
                                              ])),
                                              _: 1,
                                              __: [8]
                                            })
                                          ]),
                                          _: 2
                                        }, 1032, ["src"]))
                                      : (_openBlock(), _createBlock(_component_v_icon, {
                                          key: 1,
                                          size: "12"
                                        }, {
                                          default: _withCtx(() => _cache[9] || (_cache[9] = [
                                            _createTextVNode("mdi-puzzle")
                                          ])),
                                          _: 1,
                                          __: [9]
                                        }))
                                  ]),
                                  _: 2
                                }, 1024),
                                _createTextVNode(" " + _toDisplayString(plugin.name), 1)
                              ]),
                              _: 2
                            }, 1032, ["onClick", "loading"]))
                          }), 128))
                        ]),
                        _createVNode(_component_v_divider, { class: "my-2" }),
                        _createVNode(_component_v_btn, {
                          size: "small",
                          variant: "tonal",
                          block: "",
                          onClick: reloadAllRecent,
                          loading: quickReloadLoading.value,
                          "prepend-icon": "mdi-reload-alert"
                        }, {
                          default: _withCtx(() => _cache[10] || (_cache[10] = [
                            _createTextVNode(" 全部重载 ")
                          ])),
                          _: 1,
                          __: [10]
                        }, 8, ["loading"])
                      ]),
                      _: 1,
                      __: [11]
                    })
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }))
          : _createCommentVNode("", true),
        _createVNode(_component_v_btn, {
          variant: "outlined",
          size: "small",
          onClick: refreshPlugins,
          loading: loading.value,
          class: "control-btn",
          "prepend-icon": "mdi-refresh"
        }, {
          default: _withCtx(() => _cache[12] || (_cache[12] = [
            _createTextVNode(" 刷新 ")
          ])),
          _: 1,
          __: [12]
        }, 8, ["loading"]),
        _createVNode(_component_v_btn, {
          icon: "mdi-close",
          variant: "text",
          size: "small",
          onClick: _cache[1] || (_cache[1] = $event => (emit('close'))),
          class: "control-btn close-btn"
        })
      ])
    ]),
    _createElementVNode("div", _hoisted_7, [
      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(statusStats.value, (stat, index) => {
        return (_openBlock(), _createElementBlock("div", {
          class: "status-card",
          key: index
        }, [
          _createElementVNode("div", _hoisted_8, [
            _createVNode(_component_v_icon, {
              icon: stat.icon,
              size: "18"
            }, null, 8, ["icon"])
          ]),
          _createElementVNode("div", _hoisted_9, [
            _createElementVNode("div", _hoisted_10, _toDisplayString(stat.value), 1),
            _createElementVNode("div", _hoisted_11, _toDisplayString(stat.label), 1)
          ]),
          _cache[13] || (_cache[13] = _createElementVNode("div", { class: "status-glow" }, null, -1))
        ]))
      }), 128))
    ]),
    (globalMessage.value)
      ? (_openBlock(), _createBlock(_component_v_alert, {
          key: 0,
          type: globalMessageType.value,
          variant: "tonal",
          closable: "",
          "onClick:close": clearMessage,
          class: "mb-3 alert-panel"
        }, {
          default: _withCtx(() => [
            _createTextVNode(_toDisplayString(globalMessage.value), 1)
          ]),
          _: 1
        }, 8, ["type"]))
      : _createCommentVNode("", true),
    (loading.value && !dataLoaded.value)
      ? (_openBlock(), _createElementBlock("div", _hoisted_12, [
          _createElementVNode("div", _hoisted_13, [
            _createVNode(_component_v_progress_circular, {
              indeterminate: "",
              size: "32",
              width: "3"
            }),
            _cache[14] || (_cache[14] = _createElementVNode("div", { class: "loading-text" }, "系统扫描中...", -1))
          ])
        ]))
      : (error.value)
        ? (_openBlock(), _createElementBlock("div", _hoisted_14, [
            _createVNode(_component_v_icon, {
              size: "48",
              class: "mb-3"
            }, {
              default: _withCtx(() => _cache[15] || (_cache[15] = [
                _createTextVNode("mdi-alert-octagon")
              ])),
              _: 1,
              __: [15]
            }),
            _cache[17] || (_cache[17] = _createElementVNode("div", { class: "error-title" }, "系统故障", -1)),
            _createElementVNode("div", _hoisted_15, _toDisplayString(error.value), 1),
            _createVNode(_component_v_btn, {
              onClick: refreshPlugins,
              variant: "outlined",
              class: "mt-3"
            }, {
              default: _withCtx(() => _cache[16] || (_cache[16] = [
                _createTextVNode(" 重新连接 ")
              ])),
              _: 1,
              __: [16]
            })
          ]))
        : (filteredPlugins.value.length === 0)
          ? (_openBlock(), _createElementBlock("div", _hoisted_16, [
              _createVNode(_component_v_icon, {
                size: "64",
                class: "mb-3"
              }, {
                default: _withCtx(() => _cache[18] || (_cache[18] = [
                  _createTextVNode("mdi-package-variant-closed")
                ])),
                _: 1,
                __: [18]
              }),
              _createElementVNode("div", _hoisted_17, _toDisplayString(searchQuery.value ? '未发现目标' : '插件库为空'), 1),
              _createElementVNode("div", _hoisted_18, _toDisplayString(searchQuery.value ? '调整搜索参数' : '等待插件部署'), 1)
            ]))
          : (_openBlock(), _createElementBlock("div", _hoisted_19, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(filteredPlugins.value, (plugin) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: plugin.id,
                  class: _normalizeClass(["plugin-module", {
            'module-active': plugin.running,
            'module-installed': plugin.installed,
            'module-local': plugin.type === 'local'
          }])
                }, [
                  _createElementVNode("div", _hoisted_20, [
                    _createElementVNode("div", _hoisted_21, [
                      _createVNode(_component_v_avatar, {
                        size: "32",
                        class: "plugin-avatar"
                      }, {
                        default: _withCtx(() => [
                          (plugin.icon)
                            ? (_openBlock(), _createBlock(_component_v_img, {
                                key: 0,
                                src: plugin.icon,
                                onError: handleImageError
                              }, {
                                placeholder: _withCtx(() => [
                                  _createVNode(_component_v_icon, { size: "18" }, {
                                    default: _withCtx(() => _cache[19] || (_cache[19] = [
                                      _createTextVNode("mdi-puzzle")
                                    ])),
                                    _: 1,
                                    __: [19]
                                  })
                                ]),
                                _: 2
                              }, 1032, ["src"]))
                            : (_openBlock(), _createBlock(_component_v_icon, {
                                key: 1,
                                size: "18"
                              }, {
                                default: _withCtx(() => _cache[20] || (_cache[20] = [
                                  _createTextVNode("mdi-puzzle")
                                ])),
                                _: 1,
                                __: [20]
                              }))
                        ]),
                        _: 2
                      }, 1024),
                      _createElementVNode("div", {
                        class: _normalizeClass(["status-dot", getStatusClass(plugin)])
                      }, null, 2)
                    ]),
                    _createElementVNode("div", _hoisted_22, [
                      _createElementVNode("div", _hoisted_23, _toDisplayString(plugin.name), 1),
                      _createElementVNode("div", _hoisted_24, "v" + _toDisplayString(plugin.version) + " • " + _toDisplayString(plugin.author), 1)
                    ]),
                    _createElementVNode("div", _hoisted_25, [
                      _createVNode(_component_v_chip, {
                        size: "x-small",
                        color: getStatusColor(plugin),
                        variant: "flat",
                        class: "status-chip"
                      }, {
                        default: _withCtx(() => [
                          _createTextVNode(_toDisplayString(getStatusText(plugin)), 1)
                        ]),
                        _: 2
                      }, 1032, ["color"])
                    ])
                  ]),
                  _createElementVNode("div", _hoisted_26, [
                    _createVNode(_component_v_chip, {
                      size: "x-small",
                      color: plugin.type === 'local' ? 'primary' : 'info',
                      variant: "outlined",
                      class: "type-chip"
                    }, {
                      default: _withCtx(() => [
                        _createTextVNode(_toDisplayString(plugin.type === 'local' ? '本地' : '在线'), 1)
                      ]),
                      _: 2
                    }, 1032, ["color"]),
                    (plugin.has_update)
                      ? (_openBlock(), _createBlock(_component_v_chip, {
                          key: 0,
                          size: "x-small",
                          color: "error",
                          variant: "flat",
                          class: "update-chip"
                        }, {
                          default: _withCtx(() => _cache[21] || (_cache[21] = [
                            _createTextVNode(" 有更新 ")
                          ])),
                          _: 1,
                          __: [21]
                        }))
                      : _createCommentVNode("", true)
                  ]),
                  _createElementVNode("div", _hoisted_27, [
                    (plugin.installed)
                      ? (_openBlock(), _createBlock(_component_v_btn, {
                          key: 0,
                          size: "small",
                          variant: "outlined",
                          onClick: $event => (reloadPlugin(plugin)),
                          loading: reloadingPlugins.value.has(plugin.id),
                          class: "control-action reload-action",
                          "prepend-icon": "mdi-reload"
                        }, {
                          default: _withCtx(() => _cache[22] || (_cache[22] = [
                            _createTextVNode(" 重载 ")
                          ])),
                          _: 2,
                          __: [22]
                        }, 1032, ["onClick", "loading"]))
                      : _createCommentVNode("", true),
                    _createVNode(_component_v_btn, {
                      size: "small",
                      color: "error",
                      variant: "text",
                      onClick: $event => (showActionDialog(plugin)),
                      class: "control-action danger-action",
                      "prepend-icon": plugin.installed ? 'mdi-delete' : 'mdi-folder-remove'
                    }, {
                      default: _withCtx(() => [
                        _createTextVNode(_toDisplayString(plugin.installed ? '卸载' : '清理'), 1)
                      ]),
                      _: 2
                    }, 1032, ["onClick", "prepend-icon"])
                  ]),
                  (reloadingPlugins.value.has(plugin.id))
                    ? (_openBlock(), _createElementBlock("div", _hoisted_28, [
                        _createVNode(_component_v_progress_circular, {
                          indeterminate: "",
                          size: "20",
                          width: "2"
                        })
                      ]))
                    : _createCommentVNode("", true)
                ], 2))
              }), 128))
            ])),
    _createVNode(_component_v_dialog, {
      modelValue: actionDialog.value,
      "onUpdate:modelValue": _cache[6] || (_cache[6] = $event => ((actionDialog).value = $event)),
      "max-width": "400"
    }, {
      default: _withCtx(() => [
        _createElementVNode("div", _hoisted_29, [
          _createElementVNode("div", _hoisted_30, [
            _createVNode(_component_v_icon, {
              color: selectedPlugin.value?.installed ? 'error' : 'warning',
              size: "24",
              class: "mr-2"
            }, {
              default: _withCtx(() => [
                _createTextVNode(_toDisplayString(selectedPlugin.value?.installed ? 'mdi-delete-alert' : 'mdi-folder-remove'), 1)
              ]),
              _: 1
            }, 8, ["color"]),
            _createElementVNode("span", _hoisted_31, _toDisplayString(selectedPlugin.value?.installed ? '卸载模块' : '清理文件'), 1)
          ]),
          _createElementVNode("div", _hoisted_32, [
            _createElementVNode("div", _hoisted_33, [
              _createElementVNode("div", _hoisted_34, _toDisplayString(selectedPlugin.value?.name), 1),
              _createElementVNode("div", _hoisted_35, " 版本: " + _toDisplayString(selectedPlugin.value?.version) + " | 作者: " + _toDisplayString(selectedPlugin.value?.author), 1)
            ]),
            _createVNode(_component_v_alert, {
              type: selectedPlugin.value?.installed ? 'warning' : 'error',
              variant: "tonal",
              class: "mb-3 warning-alert"
            }, {
              default: _withCtx(() => [
                _createTextVNode(_toDisplayString(selectedPlugin.value?.installed 
                ? '此操作将卸载插件并可选择清理相关数据' 
                : '此操作将强制删除插件文件夹，无法恢复'), 1)
              ]),
              _: 1
            }, 8, ["type"]),
            _createElementVNode("div", _hoisted_36, [
              _createVNode(_component_v_checkbox, {
                modelValue: clearConfig.value,
                "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => ((clearConfig).value = $event)),
                label: "清除插件配置",
                density: "compact",
                "hide-details": "",
                class: "option-item"
              }, null, 8, ["modelValue"]),
              _createVNode(_component_v_checkbox, {
                modelValue: clearData.value,
                "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => ((clearData).value = $event)),
                label: "清除插件数据",
                density: "compact",
                "hide-details": "",
                class: "option-item"
              }, null, 8, ["modelValue"]),
              (!selectedPlugin.value?.installed)
                ? (_openBlock(), _createBlock(_component_v_checkbox, {
                    key: 0,
                    modelValue: forceClean.value,
                    "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => ((forceClean).value = $event)),
                    label: "强制清理文件（危险操作）",
                    density: "compact",
                    "hide-details": "",
                    class: "option-item"
                  }, null, 8, ["modelValue"]))
                : _createCommentVNode("", true)
            ])
          ]),
          _createElementVNode("div", _hoisted_37, [
            _createVNode(_component_v_btn, {
              onClick: _cache[5] || (_cache[5] = $event => (actionDialog.value = false)),
              variant: "text"
            }, {
              default: _withCtx(() => _cache[23] || (_cache[23] = [
                _createTextVNode("取消")
              ])),
              _: 1,
              __: [23]
            }),
            _createVNode(_component_v_btn, {
              color: selectedPlugin.value?.installed ? 'error' : 'warning',
              onClick: confirmAction,
              loading: actionLoading.value,
              variant: "outlined"
            }, {
              default: _withCtx(() => [
                _createTextVNode(" 确认" + _toDisplayString(selectedPlugin.value?.installed ? '卸载' : '清理'), 1)
              ]),
              _: 1
            }, 8, ["color", "loading"])
          ])
        ])
      ]),
      _: 1
    }, 8, ["modelValue"])
  ]))
}
}

};
const PageComponent = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-2723ac4f"]]);

export { _export_sfc as _, PageComponent as default };
