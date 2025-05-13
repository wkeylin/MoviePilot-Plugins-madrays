<template>
  <div class="plugin-page">
    <v-card flat class="rounded border">
      <!-- 标题区域 -->
      <v-card-title class="text-subtitle-1 d-flex align-center px-3 py-2 bg-primary-gradient">
        <v-icon icon="mdi-file-link" class="mr-2" color="primary" size="small" />
        <span>115网盘STRM助手</span>
      </v-card-title>
      
      <!-- 通知区域 -->
      <v-card-text class="px-3 py-2">
        <v-alert v-if="error" type="error" density="compact" class="mb-2" variant="tonal" closable>{{ error }}</v-alert>
        <v-alert v-if="actionMessage" :type="actionMessageType" density="compact" class="mb-2" variant="tonal" closable>{{ actionMessage }}</v-alert>
        
        <v-skeleton-loader v-if="loading && !initialDataLoaded" type="article, actions"></v-skeleton-loader>

        <div v-if="initialDataLoaded" class="my-1">
          <!-- 状态和功能区 -->
          <v-row>
            <v-col cols="12" md="6">
              <!-- 基础状态 -->
              <v-card flat class="rounded mb-3 border config-card">
                <v-card-title class="text-subtitle-2 d-flex align-center px-3 py-2 bg-primary-gradient">
                  <v-icon icon="mdi-information" class="mr-2" color="primary" size="small" />
                  <span>系统状态</span>
                </v-card-title>
                <v-card-text class="pa-0">
                  <v-list class="bg-transparent pa-0">
                    <v-list-item class="px-3 py-1">
                      <template v-slot:prepend>
                        <v-icon :color="status.enabled ? 'success' : 'grey'" icon="mdi-power" size="small" />
                      </template>
                      <v-list-item-title class="text-body-2">插件状态</v-list-item-title>
                      <template v-slot:append>
                        <v-chip
                          :color="status.enabled ? 'success' : 'grey'"
                          size="x-small"
                          variant="tonal"
                        >
                          {{ status.enabled ? '已启用' : '已禁用' }}
                        </v-chip>
                      </template>
                    </v-list-item>
                    <v-divider class="my-1"></v-divider>
                    <v-list-item class="px-3 py-1">
                      <template v-slot:prepend>
                        <v-icon :color="status.has_client && initialConfig?.cookies ? 'success' : 'error'" icon="mdi-account-check" size="small" />
                      </template>
                      <v-list-item-title class="text-body-2">115客户端状态</v-list-item-title>
                      <template v-slot:append>
                        <v-chip
                          :color="status.has_client && initialConfig?.cookies ? 'success' : 'error'"
                          size="x-small"
                          variant="tonal"
                        >
                          {{ status.has_client && initialConfig?.cookies ? '已连接' : '未连接' }}
                        </v-chip>
                      </template>
                    </v-list-item>
                    <v-divider class="my-1"></v-divider>
                    <v-list-item class="px-3 py-1">
                      <template v-slot:prepend>
                        <v-icon :color="status.running ? 'warning' : 'success'" icon="mdi-play-circle" size="small" />
                      </template>
                      <v-list-item-title class="text-body-2">任务状态</v-list-item-title>
                      <template v-slot:append>
                        <v-chip
                          :color="status.running ? 'warning' : 'success'"
                          size="x-small"
                          variant="tonal"
                        >
                          {{ status.running ? '运行中' : '空闲' }}
                        </v-chip>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
              
              <!-- 功能状态 -->
              <v-card flat class="rounded mb-3 border config-card">
                <v-card-title class="text-subtitle-2 d-flex align-center px-3 py-2 bg-primary-gradient">
                  <v-icon icon="mdi-puzzle" class="mr-2" color="primary" size="small" />
                  <span>功能配置</span>
                </v-card-title>
                <v-card-text class="pa-0">
                  <v-list class="bg-transparent pa-0">
                    <v-list-item class="px-3 py-1">
                      <template v-slot:prepend>
                        <v-icon :color="initialConfig?.transfer_monitor_enabled ? 'success' : 'grey'" icon="mdi-file-move" size="small" />
                      </template>
                      <v-list-item-title class="text-body-2">监控MP整理</v-list-item-title>
                      <template v-slot:append>
                        <v-chip
                          :color="initialConfig?.transfer_monitor_enabled ? 'success' : 'grey'"
                          size="x-small"
                          variant="tonal"
                        >
                          {{ initialConfig?.transfer_monitor_enabled ? '已启用' : '已禁用' }}
                        </v-chip>
                      </template>
                    </v-list-item>
                    <v-divider class="my-1"></v-divider>
                    <v-list-item class="px-3 py-1">
                      <template v-slot:prepend>
                        <v-icon :color="initialConfig?.timing_full_sync_strm ? 'success' : 'grey'" icon="mdi-sync" size="small" />
                      </template>
                      <v-list-item-title class="text-body-2">定期全量同步</v-list-item-title>
                      <template v-slot:append>
                        <v-chip
                          :color="initialConfig?.timing_full_sync_strm ? 'success' : 'grey'"
                          size="x-small"
                          variant="tonal"
                        >
                          {{ initialConfig?.timing_full_sync_strm ? '已启用' : '已禁用' }}
                        </v-chip>
                      </template>
                    </v-list-item>
                    <v-divider class="my-1"></v-divider>
                    <v-list-item class="px-3 py-1">
                      <template v-slot:prepend>
                        <v-icon :color="initialConfig?.monitor_life_enabled ? 'success' : 'grey'" icon="mdi-calendar-heart" size="small" />
                      </template>
                      <v-list-item-title class="text-body-2">监控115生活事件</v-list-item-title>
                      <template v-slot:append>
                        <v-chip
                          :color="initialConfig?.monitor_life_enabled ? 'success' : 'grey'"
                          size="x-small"
                          variant="tonal"
                        >
                          {{ initialConfig?.monitor_life_enabled ? '已启用' : '已禁用' }}
                        </v-chip>
                      </template>
                    </v-list-item>
                    <v-divider class="my-1"></v-divider>
                    <v-list-item class="px-3 py-1">
                      <template v-slot:prepend>
                        <v-icon :color="initialConfig?.pan_transfer_enabled ? 'success' : 'grey'" icon="mdi-transfer" size="small" />
                      </template>
                      <v-list-item-title class="text-body-2">网盘整理</v-list-item-title>
                      <template v-slot:append>
                        <v-chip
                          :color="initialConfig?.pan_transfer_enabled ? 'success' : 'grey'"
                          size="x-small"
                          variant="tonal"
                        >
                          {{ initialConfig?.pan_transfer_enabled ? '已启用' : '已禁用' }}
                        </v-chip>
                      </template>
                    </v-list-item>
                    <v-divider class="my-1"></v-divider>
                    <v-list-item class="px-3 py-1">
                      <template v-slot:prepend>
                        <v-icon :color="initialConfig?.clear_recyclebin_enabled || initialConfig?.clear_receive_path_enabled ? 'success' : 'grey'" icon="mdi-broom" size="small" />
                      </template>
                      <v-list-item-title class="text-body-2">定期清理</v-list-item-title>
                      <template v-slot:append>
                        <v-chip
                          :color="initialConfig?.clear_recyclebin_enabled || initialConfig?.clear_receive_path_enabled ? 'success' : 'grey'"
                          size="x-small"
                          variant="tonal"
                        >
                          {{ initialConfig?.clear_recyclebin_enabled || initialConfig?.clear_receive_path_enabled ? '已启用' : '已禁用' }}
                        </v-chip>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="6">
              <!-- 路径状态 -->
              <v-card flat class="rounded mb-3 border config-card">
                <v-card-title class="text-subtitle-2 d-flex align-center px-3 py-2 bg-primary-gradient">
                  <v-icon icon="mdi-folder-search" class="mr-2" color="primary" size="small" />
                  <span>路径配置</span>
                </v-card-title>
                <v-card-text class="pa-0">
                  <v-list class="bg-transparent pa-0">
                    <v-list-item v-if="initialConfig?.transfer_monitor_enabled" class="px-3 py-1 mb-2">
                      <v-list-item-title class="text-body-2 font-weight-medium">监控MP整理路径</v-list-item-title>
                      <template v-if="getPathsCount(initialConfig?.transfer_monitor_paths) > 0">
                        <v-list-item-subtitle v-for="(path, index) in getParsedPaths(initialConfig?.transfer_monitor_paths)" :key="index" class="text-caption mt-1">
                          <div class="d-flex">
                            <v-chip size="x-small" color="primary" variant="outlined" class="mr-2">本地</v-chip>
                            <span class="text-truncate">{{ path.local }}</span>
                          </div>
                          <div class="d-flex mt-1">
                            <v-chip size="x-small" color="amber-darken-2" variant="outlined" class="mr-2">网盘</v-chip>
                            <span class="text-truncate">{{ path.remote }}</span>
                          </div>
                        </v-list-item-subtitle>
                      </template>
                      <template v-else>
                        <v-list-item-subtitle class="text-caption text-error">未配置路径</v-list-item-subtitle>
                      </template>
                    </v-list-item>
                    
                    <v-divider v-if="initialConfig?.transfer_monitor_enabled" class="my-1"></v-divider>
                    
                    <v-list-item v-if="initialConfig?.timing_full_sync_strm" class="px-3 py-1 mb-2">
                      <v-list-item-title class="text-body-2 font-weight-medium">全量同步路径</v-list-item-title>
                      <template v-if="getPathsCount(initialConfig?.full_sync_strm_paths) > 0">
                        <v-list-item-subtitle v-for="(path, index) in getParsedPaths(initialConfig?.full_sync_strm_paths)" :key="index" class="text-caption mt-1">
                          <div class="d-flex">
                            <v-chip size="x-small" color="primary" variant="outlined" class="mr-2">本地</v-chip>
                            <span class="text-truncate">{{ path.local }}</span>
                          </div>
                          <div class="d-flex mt-1">
                            <v-chip size="x-small" color="amber-darken-2" variant="outlined" class="mr-2">网盘</v-chip>
                            <span class="text-truncate">{{ path.remote }}</span>
                          </div>
                        </v-list-item-subtitle>
                      </template>
                      <template v-else>
                        <v-list-item-subtitle class="text-caption text-error">未配置路径</v-list-item-subtitle>
                      </template>
                    </v-list-item>
                    
                    <v-divider v-if="initialConfig?.timing_full_sync_strm" class="my-1"></v-divider>
                    
                    <v-list-item v-if="initialConfig?.monitor_life_enabled" class="px-3 py-1">
                      <v-list-item-title class="text-body-2 font-weight-medium">监控115生活事件路径</v-list-item-title>
                      <template v-if="getPathsCount(initialConfig?.monitor_life_paths) > 0">
                        <v-list-item-subtitle v-for="(path, index) in getParsedPaths(initialConfig?.monitor_life_paths)" :key="index" class="text-caption mt-1">
                          <div class="d-flex">
                            <v-chip size="x-small" color="primary" variant="outlined" class="mr-2">本地</v-chip>
                            <span class="text-truncate">{{ path.local }}</span>
                          </div>
                          <div class="d-flex mt-1">
                            <v-chip size="x-small" color="amber-darken-2" variant="outlined" class="mr-2">网盘</v-chip>
                            <span class="text-truncate">{{ path.remote }}</span>
                          </div>
                        </v-list-item-subtitle>
                      </template>
                      <template v-else>
                        <v-list-item-subtitle class="text-caption text-error">未配置路径</v-list-item-subtitle>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
              
              <!-- 配置提示卡片 -->
              <v-card v-if="!status.has_client || !initialConfig.cookies" flat class="rounded mb-3 border config-card">
                <v-card-text class="pa-3">
                  <div class="d-flex">
                    <v-icon icon="mdi-alert-circle" color="error" class="mr-2" size="small"></v-icon>
                    <div class="text-body-2">
                      <p class="mb-1"><strong>未配置115 Cookie或Cookie无效</strong></p>
                      <p class="mb-0">请在配置页面中设置有效的115网盘Cookie，可通过扫码登录获取。</p>
                      <v-btn
                        color="primary"
                        variant="text"
                        size="small"
                        class="mt-2 px-2 py-1"
                        @click="emit('switch')"
                      >
                        <v-icon size="small" class="mr-1">mdi-cog</v-icon>前往配置
                      </v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
              
              <v-card v-else-if="!isProperlyCongifured" flat class="rounded mb-3 border config-card">
                <v-card-text class="pa-3">
                  <div class="d-flex">
                    <v-icon icon="mdi-alert-circle" color="warning" class="mr-2" size="small"></v-icon>
                    <div class="text-body-2">
                      <p class="mb-1"><strong>路径配置不完整</strong></p>
                      <p class="mb-0">您已配置115 Cookie，但部分功能路径未配置。请前往配置页面完善路径设置。</p>
                      <v-btn
                        color="primary"
                        variant="text"
                        size="small"
                        class="mt-2 px-2 py-1"
                        @click="emit('switch')"
                      >
                        <v-icon size="small" class="mr-1">mdi-cog</v-icon>前往配置
                      </v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- 帮助信息卡片 -->
          <v-card flat class="rounded mb-3 border config-card">
            <v-card-text class="d-flex align-center px-3 py-2">
              <v-icon icon="mdi-information" color="info" class="mr-2" size="small"></v-icon>
              <span class="text-body-2">
                点击"配置"按钮进行设置，"全量同步"和"分享同步"按钮可立即执行相应任务。
              </span>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
      
      <v-divider></v-divider>
      
      <v-card-actions class="px-2 py-1">
        <v-btn color="info" @click="refreshStatus" prepend-icon="mdi-refresh" :disabled="refreshing" :loading="refreshing" variant="text" size="small">刷新状态</v-btn>
        <v-spacer></v-spacer>
        <v-btn 
          color="warning" 
          prepend-icon="mdi-sync" 
          :disabled="!status.enabled || !status.has_client || actionLoading" 
          :loading="syncLoading"
          @click="triggerFullSync" 
          variant="text" 
          size="small"
        >
          全量同步
        </v-btn>
        <v-btn 
          color="info" 
          prepend-icon="mdi-share-variant" 
          :disabled="!status.enabled || !status.has_client || actionLoading" 
          :loading="shareSyncLoading"
          @click="openShareDialog" 
          variant="text" 
          size="small"
        >
          分享同步
        </v-btn>
        <v-btn color="primary" @click="emit('switch')" prepend-icon="mdi-cog" variant="text" size="small">配置</v-btn>
        <v-btn color="grey" @click="emit('close')" prepend-icon="mdi-close" variant="text" size="small">关闭</v-btn>
      </v-card-actions>
    </v-card>
  </div>
  
  <!-- 分享同步对话框 -->
  <v-dialog v-model="shareDialog.show" max-width="600">
    <v-card>
      <v-card-title class="text-subtitle-1 d-flex align-center px-3 py-2 bg-primary-lighten-5">
        <v-icon icon="mdi-share-variant" class="mr-2" color="primary" size="small" />
        <span>115网盘分享同步</span>
      </v-card-title>
      
      <v-card-text class="px-3 py-3">
        <v-alert v-if="shareDialog.error" type="error" density="compact" class="mb-3" variant="tonal">
          {{ shareDialog.error }}
        </v-alert>
        
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="shareDialog.shareLink"
              label="分享链接"
              hint="115网盘分享链接"
              persistent-hint
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="shareDialog.shareCode"
              label="分享码"
              hint="分享码，和分享链接选填一项"
              persistent-hint
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="shareDialog.receiveCode"
              label="分享密码"
              hint="分享密码，如有则必填"
              persistent-hint
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="shareDialog.panPath"
              label="分享文件夹路径"
              hint="分享文件在网盘中的路径，默认为根目录/"
              persistent-hint
              variant="outlined"
              density="compact"
              append-icon="mdi-folder-network"
              @click:append="openShareDirSelector('remote')"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="shareDialog.localPath"
              label="本地生成STRM路径"
              hint="本地生成STRM文件的路径"
              persistent-hint
              variant="outlined"
              density="compact"
              append-icon="mdi-folder"
              @click:append="openShareDirSelector('local')"
            ></v-text-field>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col cols="12">
            <v-switch v-model="shareDialog.downloadMediaInfo" label="下载媒体数据文件" color="primary" density="compact"></v-switch>
          </v-col>
        </v-row>
        
        <v-alert type="info" variant="tonal" density="compact" class="mt-1">
          分享链接/分享码和分享密码 只需要二选一配置即可。<br>
          同时填写分享链接，分享码和分享密码时，优先读取分享链接。
        </v-alert>
      </v-card-text>
      
      <v-divider></v-divider>
      <v-card-actions class="px-3 py-2">
        <v-btn color="grey" variant="text" @click="closeShareDialog" size="small">取消</v-btn>
        <v-spacer></v-spacer>
        <v-btn 
          color="primary" 
          variant="text" 
          @click="executeShareSync" 
          :loading="shareSyncLoading"
          :disabled="!isShareDialogValid"
          size="small"
        >
          开始同步
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  
  <!-- 目录选择器对话框 -->
  <v-dialog v-model="dirDialog.show" max-width="800">
    <v-card>
      <v-card-title class="text-subtitle-1 d-flex align-center px-3 py-2 bg-primary-lighten-5">
        <v-icon :icon="dirDialog.isLocal ? 'mdi-folder-search' : 'mdi-folder-network'" class="mr-2" color="primary" />
        <span>{{ dirDialog.isLocal ? '选择本地目录' : '选择网盘目录' }}</span>
      </v-card-title>
      
      <v-card-text class="px-3 py-2">
        <div v-if="dirDialog.loading" class="d-flex justify-center my-3">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        
        <div v-else>
          <!-- 当前路径显示 -->
          <v-text-field
            v-model="dirDialog.currentPath"
            label="当前路径"
            variant="outlined"
            density="compact"
            class="mb-2"
            @keyup.enter="loadDirContent"
          ></v-text-field>
          
          <!-- 文件列表 -->
          <v-list class="border rounded" max-height="300px" overflow-y="auto">
            <v-list-item
              v-if="dirDialog.currentPath !== '/' && dirDialog.currentPath !== 'C:\\' && dirDialog.currentPath !== 'C:/'"
              @click="navigateToParentDir"
              class="py-1"
            >
              <template v-slot:prepend>
                <v-icon icon="mdi-arrow-up" size="small" class="mr-2" color="grey" />
              </template>
              <v-list-item-title class="text-body-2">上级目录</v-list-item-title>
              <v-list-item-subtitle>..</v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item
              v-for="(item, index) in dirDialog.items"
              :key="index"
              @click="selectDir(item)"
              :disabled="!item.is_dir"
              class="py-1"
            >
              <template v-slot:prepend>
                <v-icon 
                  :icon="item.is_dir ? 'mdi-folder' : 'mdi-file'" 
                  size="small" 
                  class="mr-2"
                  :color="item.is_dir ? 'amber-darken-2' : 'blue'"
                />
              </template>
              <v-list-item-title class="text-body-2">{{ item.name }}</v-list-item-title>
            </v-list-item>
            
            <v-list-item v-if="!dirDialog.items.length" class="py-2 text-center">
              <v-list-item-title class="text-body-2 text-grey">该目录为空或访问受限</v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
        
        <v-alert v-if="dirDialog.error" type="error" density="compact" class="mt-2 text-caption" variant="tonal">
          {{ dirDialog.error }}
        </v-alert>
      </v-card-text>
      
      <v-card-actions class="px-3 py-2">
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="confirmDirSelection"
          :disabled="!dirDialog.currentPath || dirDialog.loading"
          variant="text"
          size="small"
        >
          选择当前目录
        </v-btn>
        <v-btn
          color="grey"
          @click="closeDirDialog"
          variant="text"
          size="small"
        >
          取消
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';

const props = defineProps({
  api: {
    type: [Object, Function],
    required: true
  },
  // 接收从父组件传递的配置数据
  initialConfig: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'switch', 'update:config']);

// 状态变量
const loading = ref(true);
const refreshing = ref(false);
const syncLoading = ref(false);
const shareSyncLoading = ref(false);
const initialDataLoaded = ref(false);
const error = ref(null);
const actionMessage = ref(null);
const actionMessageType = ref('info');
const actionLoading = ref(false);

const status = reactive({
  enabled: false,
  has_client: false,
  running: false
});

// 计算属性：路径配置是否完整
const isProperlyCongifured = computed(() => {
  if (!props.initialConfig) return false;
  
  const hasBasicConfig = props.initialConfig.enabled && props.initialConfig.cookies && props.initialConfig.moviepilot_address;
  if (!hasBasicConfig) return false;
  
  // 至少一个功能区域配置了路径
  const hasTransferPaths = getPathsCount(props.initialConfig.transfer_monitor_paths) > 0 && props.initialConfig.transfer_monitor_enabled;
  const hasFullSyncPaths = getPathsCount(props.initialConfig.full_sync_strm_paths) > 0 && (props.initialConfig.timing_full_sync_strm || props.initialConfig.once_full_sync_strm);
  const hasLifePaths = getPathsCount(props.initialConfig.monitor_life_paths) > 0 && props.initialConfig.monitor_life_enabled;
  const hasSharePaths = props.initialConfig.user_share_local_path && props.initialConfig.user_share_pan_path && props.initialConfig.share_strm_enabled;
  
  return hasTransferPaths || hasFullSyncPaths || hasLifePaths || hasSharePaths;
});

// 计算路径数量
const getPathsCount = (pathString) => {
  if (!pathString) return 0;
  
  try {
    // 根据换行符拆分路径字符串，并过滤掉空行
    const paths = pathString.split('\n').filter(line => line.trim() && line.includes('#'));
    return paths.length;
  } catch (e) {
    console.error('解析路径字符串失败:', e);
    return 0;
  }
};

// 获取插件状态
const getStatus = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // 获取插件ID
    const pluginId = "P115StrmHelper";
    
    // 调用API获取状态
    const result = await props.api.get(`plugin/${pluginId}/get_status`);
    
    if (result && result.code === 0 && result.data) {
      // 确保从API获取实际状态，而不是使用默认值
      status.enabled = Boolean(result.data.enabled);
      status.has_client = Boolean(result.data.has_client);
      status.running = Boolean(result.data.running);
      
      // 同时获取并更新配置信息到props.initialConfig
      try {
        const configData = await props.api.get(`plugin/${pluginId}/get_config`);
        if (configData) {
          // 更新配置对象
          Object.assign(props.initialConfig, configData);
          console.log('已获取最新配置:', props.initialConfig);
        }
      } catch (configErr) {
        console.error('获取配置失败:', configErr);
      }
      
      initialDataLoaded.value = true;
    } else {
      // 如果API调用失败但有initialConfig，使用它的状态
      if (props.initialConfig) {
        status.enabled = Boolean(props.initialConfig.enabled);
        // 检查是否真的有有效的Cookie
        status.has_client = Boolean(props.initialConfig.cookies && props.initialConfig.cookies.trim() !== '');
        status.running = false;
        initialDataLoaded.value = true;
        
        // 如果initialConfig是空的，尝试获取配置
        if (Object.keys(props.initialConfig).length <= 1) {
          try {
            const configData = await props.api.get(`plugin/${pluginId}/get_config`);
            if (configData) {
              Object.assign(props.initialConfig, configData);
              console.log('从配置API获取配置:', props.initialConfig);
            }
          } catch (configErr) {
            console.error('获取配置失败:', configErr);
          }
        }
        
        throw new Error('状态API调用失败，使用配置数据显示状态');
      } else {
        throw new Error(result?.msg || '获取状态失败，请检查网络连接');
      }
    }
  } catch (err) {
    if (!err.message.includes('使用配置数据显示状态')) {
      error.value = `获取状态失败: ${err.message || '未知错误'}`;
    }
    console.error('获取状态失败:', err);
  } finally {
    loading.value = false;
  }
};

// 刷新状态
const refreshStatus = async () => {
  refreshing.value = true;
  await getStatus();
  refreshing.value = false;
  
  actionMessage.value = '状态已刷新';
  actionMessageType.value = 'success';
  
  // 3秒后清除消息
  setTimeout(() => {
    actionMessage.value = null;
  }, 3000);
};

// 触发全量同步
const triggerFullSync = async () => {
  syncLoading.value = true;
  actionLoading.value = true;
  error.value = null;
  actionMessage.value = null;
  
  try {
    // 检查状态
    if (!status.enabled) {
      throw new Error('插件未启用，请先在配置页面启用插件');
    }
    
    if (!status.has_client) {
      throw new Error('插件未配置Cookie或Cookie无效，请先在配置页面设置115 Cookie');
    }
    
    if (getPathsCount(props.initialConfig?.full_sync_strm_paths) === 0) {
      throw new Error('未配置全量同步路径，请先在配置页面设置同步路径');
    }
    
    // 获取插件ID
    const pluginId = "P115StrmHelper";
    
    // 调用API触发全量同步
    const result = await props.api.post(`plugin/${pluginId}/full_sync`);
    
    if (result && result.code === 0) {
      actionMessage.value = result.msg || '全量同步任务已启动';
      actionMessageType.value = 'success';
      // 刷新状态
      await getStatus();
    } else {
      throw new Error(result?.msg || '启动全量同步失败');
    }
  } catch (err) {
    error.value = `启动全量同步失败: ${err.message || '未知错误'}`;
    console.error('启动全量同步失败:', err);
  } finally {
    syncLoading.value = false;
    actionLoading.value = false;
  }
};

// 分享同步对话框
const shareDialog = reactive({
  show: false,
  error: null,
  shareLink: '',
  shareCode: '',
  receiveCode: '',
  panPath: '/',
  localPath: '',
  downloadMediaInfo: false
});

// 计算属性：分享对话框是否填写有效
const isShareDialogValid = computed(() => {
  // 必须有本地路径
  if (!shareDialog.localPath) return false;
  
  // 必须有分享链接或分享码，如果有分享码则必须有分享密码
  if (!shareDialog.shareLink && !shareDialog.shareCode) return false;
  if (shareDialog.shareCode && !shareDialog.receiveCode) return false;
  
  return true;
});

// 目录选择器对话框
const dirDialog = reactive({
  show: false,
  isLocal: true,
  loading: false,
  error: null,
  currentPath: '/',
  items: [],
  selectedPath: '',
  callback: null
});

// 打开分享同步对话框
const openShareDialog = () => {
  shareDialog.show = true;
  shareDialog.error = null;
  
  // 从配置中加载值
  if (props.initialConfig) {
    shareDialog.shareLink = props.initialConfig.user_share_link || '';
    shareDialog.shareCode = props.initialConfig.user_share_code || '';
    shareDialog.receiveCode = props.initialConfig.user_receive_code || '';
    shareDialog.panPath = props.initialConfig.user_share_pan_path || '/';
    shareDialog.localPath = props.initialConfig.user_share_local_path || '';
    shareDialog.downloadMediaInfo = props.initialConfig.share_strm_auto_download_mediainfo_enabled || false;
  }
};

// 关闭分享同步对话框
const closeShareDialog = () => {
  shareDialog.show = false;
};

// 打开目录选择器
const openShareDirSelector = (type) => {
  dirDialog.show = true;
  dirDialog.isLocal = type === 'local';
  dirDialog.loading = false;
  dirDialog.error = null;
  dirDialog.items = [];
  
  // 设置初始路径
  if (dirDialog.isLocal) {
    dirDialog.currentPath = shareDialog.localPath || '/';
  } else {
    dirDialog.currentPath = shareDialog.panPath || '/';
  }
  
  // 设置回调函数
  dirDialog.callback = (path) => {
    if (dirDialog.isLocal) {
      shareDialog.localPath = path;
    } else {
      shareDialog.panPath = path;
    }
  };
  
  // 加载目录内容
  loadDirContent();
};

// 加载目录内容
const loadDirContent = async () => {
  dirDialog.loading = true;
  dirDialog.error = null;
  dirDialog.items = [];
  
  try {
    // 本地目录浏览
    if (dirDialog.isLocal) {
      try {
        // 使用MoviePilot的文件管理API
        const response = await props.api.post('storage/list', {
          path: dirDialog.currentPath || '/',
          type: 'share', // 使用默认的share类型
          flag: 'ROOT'
        });
        
        if (response && Array.isArray(response)) {
          dirDialog.items = response
            .filter(item => item.type === 'dir') // 只保留目录
            .map(item => ({
              name: item.name,
              path: item.path,
              is_dir: true
            }));
        } else {
          throw new Error('浏览目录失败：无效响应');
        }
      } catch (error) {
        console.error('浏览本地目录失败:', error);
        dirDialog.error = `浏览本地目录失败: ${error.message || '未知错误'}`;
        dirDialog.items = [];
      }
    } 
    // 115网盘目录浏览
    else {
      // 获取插件ID
      const pluginId = "P115StrmHelper";
      
      // 检查cookie是否已设置
      if (!props.initialConfig?.cookies || props.initialConfig?.cookies.trim() === '') {
        throw new Error('请先设置115 Cookie才能浏览网盘目录');
      }
      
      // 调用API获取目录内容
      const result = await props.api.get(`plugin/${pluginId}/browse_dir?path=${encodeURIComponent(dirDialog.currentPath)}&is_local=${dirDialog.isLocal}`);
      
      if (result && result.code === 0 && result.items) {
        dirDialog.items = result.items.filter(item => item.is_dir); // 只保留目录
        dirDialog.currentPath = result.path || dirDialog.currentPath;
    } else {
        throw new Error(result?.msg || '获取网盘目录内容失败');
      }
    }
  } catch (error) {
    console.error('加载目录内容失败:', error);
    dirDialog.error = error.message || '获取目录内容失败';
    
    // 如果是Cookie错误，清空目录列表
    if (error.message.includes('Cookie') || error.message.includes('cookie')) {
      dirDialog.items = [];
    }
  } finally {
    dirDialog.loading = false;
  }
};

// 选择目录
const selectDir = (item) => {
  if (!item || !item.is_dir) return;
  
  if (item.path) {
    dirDialog.currentPath = item.path;
    loadDirContent();
  }
};

// 导航到父目录
const navigateToParentDir = () => {
  const path = dirDialog.currentPath;
  
  if (path === '/' || path === 'C:\\' || path === 'C:/') return;
  
  // 统一使用正斜杠处理路径
  const normalizedPath = path.replace(/\\/g, '/');
  const parts = normalizedPath.split('/').filter(Boolean);
  
  if (parts.length === 0) {
    dirDialog.currentPath = '/';
  } else if (parts.length === 1 && normalizedPath.includes(':')) {
    // Windows驱动器根目录
    dirDialog.currentPath = parts[0] + ':/';
  } else {
    // 移除最后一个部分
    parts.pop();
    dirDialog.currentPath = parts.length === 0 ? '/' : 
                           (normalizedPath.startsWith('/') ? '/' : '') + 
                           parts.join('/') + '/';
  }
  
  loadDirContent();
};

// 确认目录选择
const confirmDirSelection = () => {
  if (!dirDialog.currentPath) return;
  
  if (typeof dirDialog.callback === 'function') {
    dirDialog.callback(dirDialog.currentPath);
  }
  
  // 关闭对话框
  closeDirDialog();
};

// 关闭目录选择器对话框
const closeDirDialog = () => {
  dirDialog.show = false;
  dirDialog.items = [];
  dirDialog.error = null;
};

// 执行分享同步
const executeShareSync = async () => {
  shareSyncLoading.value = true;
  shareDialog.error = null;
  
  try {
    // 检查必填项
    if (!shareDialog.localPath) {
      throw new Error('请先设置本地生成STRM路径');
    }
    
    if (!shareDialog.shareLink && !shareDialog.shareCode) {
      throw new Error('请输入115网盘分享链接或分享码');
    }
    
    if (shareDialog.shareCode && !shareDialog.receiveCode) {
      throw new Error('使用分享码时必须输入分享密码');
    }
    
    // 获取插件ID
    const pluginId = "P115StrmHelper";
    
    // 首先保存配置
    if (props.initialConfig) {
      // 更新配置
      props.initialConfig.user_share_link = shareDialog.shareLink;
      props.initialConfig.user_share_code = shareDialog.shareCode;
      props.initialConfig.user_receive_code = shareDialog.receiveCode;
      props.initialConfig.user_share_pan_path = shareDialog.panPath;
      props.initialConfig.user_share_local_path = shareDialog.localPath;
      props.initialConfig.share_strm_auto_download_mediainfo_enabled = shareDialog.downloadMediaInfo;
      props.initialConfig.share_strm_enabled = true;
      
      // 保存配置
      await props.api.post(`plugin/${pluginId}/save_config`, props.initialConfig);
    }
    
    // 调用API触发分享同步
    const result = await props.api.post(`plugin/${pluginId}/share_sync`);
    
    if (result && result.code === 0) {
      actionMessage.value = result.msg || '分享同步任务已启动';
      actionMessageType.value = 'success';
      
      // 刷新状态
      await getStatus();
      
      // 关闭对话框
      closeShareDialog();
    } else {
      throw new Error(result?.msg || '启动分享同步失败');
    }
  } catch (err) {
    shareDialog.error = `启动分享同步失败: ${err.message || '未知错误'}`;
    console.error('启动分享同步失败:', err);
  } finally {
    shareSyncLoading.value = false;
  }
};

// 添加路径解析函数
const getParsedPaths = (pathString) => {
  if (!pathString) return [];
  
  try {
    // 根据换行符拆分路径字符串，并过滤掉空行
    const paths = pathString.split('\n').filter(line => line.trim() && line.includes('#'));
    return paths.map(path => {
      const parts = path.split('#');
      return { local: parts[0] || '', remote: parts[1] || '' };
    });
  } catch (e) {
    console.error('解析路径字符串失败:', e);
    return [];
  }
};

// 当initialConfig变化时更新状态
watch(() => props.initialConfig, (newConfig) => {
  if (newConfig) {
    status.enabled = newConfig.enabled || false;
    status.has_client = Boolean(newConfig.cookies && newConfig.cookies.trim() !== '');
  }
}, { immediate: true });

// 组件生命周期
onMounted(() => {
  getStatus();
});
</script>

<style scoped>
.config-card {
  box-shadow: none !important;
  transition: all 0.2s ease;
}

.config-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05) !important;
}

/* 统一字体 */
:deep(.v-card-title),
:deep(.v-card-text),
:deep(.v-list-item-title),
:deep(.v-list-item-subtitle),
:deep(.v-alert),
:deep(.v-btn),
:deep(.text-caption),
:deep(.text-subtitle-1),
:deep(.text-body-1),
:deep(.text-body-2) {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif !important;
}

/* 文字大小 */
:deep(.text-caption) {
  font-size: 0.8rem !important;
}

:deep(.text-body-2) {
  font-size: 0.85rem !important;
}

/* 美化卡片标题 */
.bg-primary-gradient {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1), rgba(var(--v-theme-primary), 0.05)) !important;
}

/* 美化芯片 */
:deep(.v-chip) {
  font-weight: normal;
  transition: all 0.2s ease;
}

:deep(.v-chip--selected) {
  transform: scale(1.05);
}
</style> 