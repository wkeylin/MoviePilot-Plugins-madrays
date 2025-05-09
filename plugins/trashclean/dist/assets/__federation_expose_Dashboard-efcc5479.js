import { importShared } from './__federation_fn_import-054b33c3.js';
import { _ as _export_sfc } from './_plugin-vue_export-helper-c4c0bc37.js';

const Dashboard_vue_vue_type_style_index_0_scoped_e0b28564_lang = '';

const {defineComponent,ref,reactive,onMounted,onUnmounted} = await importShared('vue');


const _sfc_main = defineComponent({
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

const {toDisplayString:_toDisplayString,createTextVNode:_createTextVNode,resolveComponent:_resolveComponent,withCtx:_withCtx,openBlock:_openBlock,createBlock:_createBlock,createCommentVNode:_createCommentVNode,createElementVNode:_createElementVNode,createVNode:_createVNode} = await importShared('vue');


function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_v_card_title = _resolveComponent("v-card-title");
  const _component_v_card_subtitle = _resolveComponent("v-card-subtitle");
  const _component_v_card_text = _resolveComponent("v-card-text");
  const _component_v_card = _resolveComponent("v-card");

  return (_openBlock(), _createBlock(_component_v_card, { class: "fill-height" }, {
    default: _withCtx(() => [
      (_ctx.config?.attrs?.title)
        ? (_openBlock(), _createBlock(_component_v_card_title, { key: 0 }, {
            default: _withCtx(() => [
              _createTextVNode(_toDisplayString(_ctx.config.attrs.title), 1)
            ]),
            _: 1
          }))
        : _createCommentVNode("", true),
      (_ctx.config?.attrs?.subtitle)
        ? (_openBlock(), _createBlock(_component_v_card_subtitle, { key: 1 }, {
            default: _withCtx(() => [
              _createTextVNode(_toDisplayString(_ctx.config.attrs.subtitle), 1)
            ]),
            _: 1
          }))
        : _createCommentVNode("", true),
      _createVNode(_component_v_card_text, null, {
        default: _withCtx(() => _cache[0] || (_cache[0] = [
          _createElementVNode("div", { class: "d-flex align-center justify-center" }, [
            _createElementVNode("span", { class: "text-h6" }, "垃圾文件清理仪表盘")
          ], -1)
        ])),
        _: 1
      })
    ]),
    _: 1
  }))
}
const Dashboard = /*#__PURE__*/_export_sfc(_sfc_main, [['render',_sfc_render],['__scopeId',"data-v-e0b28564"]]);

export { Dashboard as default };
