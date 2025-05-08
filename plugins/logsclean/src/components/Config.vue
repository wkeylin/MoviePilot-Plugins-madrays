<template>
  <div class="plugin-config">
    <v-card flat class="rounded border">
      <!-- 标题区域 -->
      <v-card-title class="text-subtitle-1 d-flex align-center px-3 py-2 bg-primary-lighten-5">
        <v-icon icon="mdi-cog" class="mr-2" color="primary" size="small" />
        <span>日志清理配置</span>
      </v-card-title>
      
      <v-card-text class="px-3 py-2">
        <v-alert v-if="error" type="error" density="compact" class="mb-2 text-caption" variant="tonal" closable>{{ error }}</v-alert>
        <v-alert v-if="successMessage" type="success" density="compact" class="mb-2 text-caption" variant="tonal" closable>{{ successMessage }}</v-alert>

        <v-form ref="form" v-model="isFormValid" @submit.prevent="saveFullConfig">
          <!-- 基本设置卡片 -->
          <v-card flat class="rounded mb-3 border config-card">
            <v-card-title class="text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5">
              <v-icon icon="mdi-tune" class="mr-2" color="primary" size="small" />
              <span>基本设置</span>
            </v-card-title>
            <v-card-text class="px-3 py-2">
              <v-row>
                <v-col cols="12" md="6">
                  <div class="setting-item d-flex align-center py-2">
                    <v-icon icon="mdi-power" size="small" :color="editableConfig.enable ? 'success' : 'grey'" class="mr-3"></v-icon>
                    <div class="setting-content flex-grow-1">
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <div class="text-subtitle-2">启用插件</div>
                          <div class="text-caption text-grey">是否启用日志自动清理功能</div>
                        </div>
                        <v-switch
                          v-model="editableConfig.enable"
                          color="primary"
                          inset
                          :disabled="saving"
                          density="compact"
                          hide-details
                          class="small-switch"
                        ></v-switch>
                      </div>
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="setting-item d-flex align-center py-2">
                    <v-icon icon="mdi-bell" size="small" :color="editableConfig.notify ? 'info' : 'grey'" class="mr-3"></v-icon>
                    <div class="setting-content flex-grow-1">
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <div class="text-subtitle-2">启用通知</div>
                          <div class="text-caption text-grey">清理完成后发送站内消息通知</div>
                        </div>
                        <v-switch
                          v-model="editableConfig.notify"
                          color="info"
                          inset
                          :disabled="saving"
                          density="compact"
                          hide-details
                          class="small-switch"
                        ></v-switch>
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- 定时任务设置 - 应用统一样式 -->
          <v-card flat class="rounded mb-3 border config-card">
            <v-card-title class="text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5">
              <v-icon icon="mdi-clock-time-five" class="mr-2" color="primary" size="small" />
              <span>定时任务设置</span>
            </v-card-title>
            <v-card-text class="px-3 py-2">
              <!-- 使用VCronField组件 -->
              <div class="mb-2">
                <VCronField
                  v-model="editableConfig.cron"
                  label="CRON表达式"
                  hint="设置日志清理的执行周期，如：30 3 * * * (每天凌晨3:30)"
                  persistent-hint
                  density="compact"
                ></VCronField>
              </div>
              
              <!-- 常用CRON预设 -->
              <div class="mt-2">
                <div class="text-caption mb-1">常用预设：</div>
                <div class="d-flex flex-wrap">
                  <v-chip
                    v-for="preset in cronPresets"
                    :key="preset.value"
                    class="ma-1"
                    variant="flat"
                    size="x-small"
                    color="primary"
                    @click="editableConfig.cron = preset.value"
                  >
                    {{ preset.title }}
                  </v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- 清理规则设置 - 应用统一样式 -->
          <v-card flat class="rounded mb-3 border config-card">
            <v-card-title class="text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5">
              <v-icon icon="mdi-filter-settings" class="mr-2" color="primary" size="small" />
              <span>清理规则</span>
            </v-card-title>
            <v-card-text class="px-3 py-2">
              <v-row>
                <v-col cols="12" md="5">
                  <v-text-field
                    v-model.number="editableConfig.rows"
                    label="日志保留行数"
                    type="number"
                    variant="outlined"
                    :min="0"
                    :rules="[v => v === null || v === '' || (Number.isInteger(Number(v)) && Number(v) >= 0) || '必须是大于等于0的整数']"
                    hint="每个日志文件保留最新的行数，0表示不保留"
                    persistent-hint
                    prepend-inner-icon="mdi-format-list-numbered"
                    :disabled="saving"
                    density="compact"
                    class="text-caption"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="7">
                  <v-select
                    v-model="editableConfig.selected_ids"
                    :items="installedPluginsList"
                    label="选择要清理的插件日志"
                    variant="outlined"
                    multiple
                    chips
                    closable-chips
                    clearable
                    item-title="title"
                    item-value="value"
                    hint="留空则清理所有插件的日志"
                    persistent-hint
                    prepend-inner-icon="mdi-folder-text"
                    :loading="loadingPlugins"
                    no-data-text="无可用插件或加载失败"
                    :disabled="saving"
                    density="compact"
                    class="text-caption"
                  >
                    <template v-slot:prepend-item>
                      <v-list-item>
                        <v-list-item-title class="text-caption px-2">
                          <v-icon icon="mdi-puzzle" size="small" class="mr-1" />
                          已安装的插件列表 ({{ installedPluginsList.length || 0 }})
                        </v-list-item-title>
                      </v-list-item>
                      <v-divider class="mt-2"></v-divider>
                    </template>
                    <template v-slot:selection="{ item, index }">
                      <v-chip v-if="index < 3" size="x-small" :color="getPluginColor(index)">
                        <span>{{ item.title }}</span>
                      </v-chip>
                      <span v-if="index === 3" class="text-caption text-grey align-self-center ml-1">
                        (+{{ editableConfig.selected_ids.length - 3 }} 个)
                      </span>
                    </template>
                  </v-select>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- 帮助信息卡片 - 应用统一样式 -->
          <v-card flat class="rounded mb-3 border config-card">
            <v-card-text class="d-flex align-center px-3 py-2">
              <v-icon icon="mdi-information" color="info" class="mr-2" size="small"></v-icon>
              <span class="text-caption">
                此插件用于定时清理各个插件生成的日志文件（位于 logs/plugins/ 目录下），防止日志文件过大。
                可设置保留最新的 N 行日志，并选择要清理的插件（不选则清理所有已安装插件）。
              </span>
            </v-card-text>
          </v-card>
        </v-form>
      </v-card-text>
      
      <v-divider></v-divider>
      
      <v-card-actions class="px-2 py-1">
        <v-btn color="info" @click="emit('switch')" prepend-icon="mdi-view-dashboard" :disabled="saving" variant="text" size="small">状态页</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="secondary" variant="text" @click="resetConfigToFetched" :disabled="!initialConfigLoaded || saving" prepend-icon="mdi-restore" size="small">重置</v-btn>
        <v-btn color="primary" :disabled="!isFormValid || saving" @click="saveFullConfig" :loading="saving" prepend-icon="mdi-content-save" variant="text" size="small">保存配置</v-btn>
        <v-btn color="grey" @click="emit('close')" prepend-icon="mdi-close" :disabled="saving" variant="text" size="small">关闭</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import CronParser from 'cron-parser';
import Cronstrue from 'cronstrue/i18n';

const props = defineProps({
  api: { 
    type: [Object, Function],
    required: true,
  },
  initialConfig: {
    type: Object,
    default: () => ({}),
  }
});

const emit = defineEmits(['close', 'switch', 'config-updated-on-server', 'save']);

const form = ref(null);
const isFormValid = ref(true);
const error = ref(null);
const successMessage = ref(null);
const saving = ref(false);
const loadingPlugins = ref(false);
const initialConfigLoaded = ref(false); // Tracks if we have loaded config from API

// Holds the config as fetched from server, used for reset
const serverFetchedConfig = reactive({}); 

// Holds the config being edited in the form
const editableConfig = reactive({
  enable: false,
  notify: false,
  cron: '30 3 * * *',
  rows: 300,
  selected_ids: [],
  onlyonce: false, // 保留此字段以保持与后端兼容，但UI上不再显示
});

// CRON预设
const cronPresets = [
  { title: '每天午夜', value: '0 0 * * *' },
  { title: '每天凌晨3点', value: '0 3 * * *' },
  { title: '每天下午6点', value: '0 18 * * *' },
  { title: '每周一凌晨3点', value: '0 3 * * 1' },
  { title: '每月1号凌晨3点', value: '0 3 1 * *' },
];

const installedPluginsList = ref([]);

// Helper functions for UI display
const getPluginColor = (index) => {
  const colors = ['primary', 'success', 'info', 'indigo', 'deep-purple', 'cyan', 'teal', 'amber'];
  return colors[index % colors.length];
};

// Function to update the editableConfig, typically from fetched data or initial prop
const setEditableConfig = (sourceConfig) => {
  if (sourceConfig && typeof sourceConfig === 'object') {
    Object.keys(editableConfig).forEach(key => {
      if (sourceConfig.hasOwnProperty(key)) {
        editableConfig[key] = JSON.parse(JSON.stringify(sourceConfig[key]));
      }
    });
  }
};

const getPluginId = () => {
  return "LogsClean";
};

async function loadInitialData() {
  error.value = null;
  saving.value = true; // Use saving as a general loading indicator for initial load phase
  initialConfigLoaded.value = false;
  
  if (!props.initialConfig) { 
    error.value = '初始配置丢失，无法加载配置'; 
    saving.value = false; 
    return; 
  }
  
  try {
    const pluginId = getPluginId();
    if (!pluginId) { 
      throw new Error('获取插件ID失败'); 
    }
    
    // 正确的API路径，不含/api/v1前缀
    const data = await props.api.get(`plugin/${pluginId}/config`);
    
    if (data) {
      setEditableConfig(data);
      Object.assign(serverFetchedConfig, JSON.parse(JSON.stringify(data))); // Store for reset
      initialConfigLoaded.value = true;
      successMessage.value = '当前配置已从服务器加载';
    } else {
      throw new Error('从服务器获取配置失败，使用宿主提供的初始配置');
    }
  } catch (err) {
    console.error('加载配置失败:', err);
    error.value = err.message || '加载配置失败，请检查网络或API';
    // Fallback to initialConfig if API fails
    setEditableConfig(props.initialConfig);
    Object.assign(serverFetchedConfig, JSON.parse(JSON.stringify(props.initialConfig)));
    successMessage.value = null;
  } finally {
    saving.value = false;
    setTimeout(() => { successMessage.value = null; error.value = null; }, 4000);
  }
}

async function loadInstalledPlugins() {
  loadingPlugins.value = true;
  
  try {
    const pluginId = getPluginId();
    if (!pluginId) { 
      throw new Error('获取插件ID失败'); 
    }
    
    // 正确的API路径，不含/api/v1/前缀
    const data = await props.api.get(`plugin/${pluginId}/installed_plugins`);
    
    if (Array.isArray(data)) {
      installedPluginsList.value = data;
    } else {
      installedPluginsList.value = [];
    }
  } catch (err) {
    console.error('获取已安装插件列表失败:', err);
    installedPluginsList.value = []; 
    error.value = '获取插件列表失败';
    setTimeout(() => { error.value = null; }, 3000);
  } finally {
    loadingPlugins.value = false;
  }
}

async function saveFullConfig() {
  error.value = null;
  successMessage.value = null;
  if (!form.value) return;
  const validation = await form.value.validate();
  if (!validation.valid) {
    error.value = '请检查表单中的错误';
    return;
  }

  saving.value = true;

  try {
    // 设置onlyonce为false，确保兼容后端
    editableConfig.onlyonce = false;
    
    // 通过emit事件保存配置，而不是通过API调用
    emit('save', JSON.parse(JSON.stringify(editableConfig)));
    successMessage.value = '配置已发送保存请求';
  } catch (err) {
    console.error('保存配置失败:', err);
    error.value = err.message || '保存配置失败，请检查网络或查看日志';
  } finally {
    saving.value = false;
    setTimeout(() => { 
      successMessage.value = null; 
      if (error.value && !error.value.startsWith('保存配置失败') && !error.value.startsWith('配置已部分保存')) { 
        error.value = null; 
      }
    }, 5000); 
  }
}

function resetConfigToFetched() {
  if (initialConfigLoaded.value) {
    setEditableConfig(serverFetchedConfig);
    error.value = null;
    successMessage.value = '配置已重置为上次从服务器加载的状态';
    if (form.value) form.value.resetValidation();
  } else {
    error.value = '尚未从服务器加载配置，无法重置';
  }
  setTimeout(() => { successMessage.value = null; error.value = null; }, 3000);
}

onMounted(() => {
  // Use initialConfig for the very first display, then fetch from server.
  setEditableConfig(props.initialConfig);
  Object.assign(serverFetchedConfig, JSON.parse(JSON.stringify(props.initialConfig)));
  
  loadInitialData(); // This will fetch from /config and update editableConfig & serverFetchedConfig
  loadInstalledPlugins();
});

</script>

<style scoped>
.plugin-config {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0.5rem;
}

.bg-primary-lighten-5 {
  background-color: rgba(var(--v-theme-primary), 0.07);
}

.border {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
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

.setting-item {
  border-radius: 8px;
  transition: all 0.2s ease;
  padding: 0.5rem;
  margin-bottom: 4px;
}

.setting-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.03);
}

.small-switch {
  transform: scale(0.8);
  margin-right: -8px;
}

.text-subtitle-2 {
  font-size: 14px !important;
  font-weight: 500;
  margin-bottom: 2px;
}
</style>
