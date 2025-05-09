<template>
  <div class="plugin-config">
    <v-card flat class="rounded border">
      <!-- 标题区域 -->
      <v-card-title class="text-subtitle-1 d-flex align-center px-3 py-2 bg-primary-lighten-5">
        <v-icon icon="mdi-cog" class="mr-2" color="primary" size="small" />
        <span>垃圾文件清理配置</span>
      </v-card-title>
      
      <v-card-text class="px-3 py-2">
        <v-alert v-if="error" type="error" density="compact" class="mb-2 text-caption" variant="tonal" closable>{{ error }}</v-alert>
        <v-alert v-if="successMessage" type="success" density="compact" class="mb-2 text-caption" variant="tonal" closable>{{ successMessage }}</v-alert>

        <v-form ref="form" v-model="isFormValid" @submit.prevent="saveConfig">
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
                          <div class="text-caption text-grey">是否启用垃圾文件自动清理功能</div>
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
              
              <v-row>
                <v-col cols="12" md="6">
                  <div class="setting-item d-flex align-center py-2">
                    <v-icon icon="mdi-download" size="small" :color="editableConfig.only_when_no_download ? 'warning' : 'grey'" class="mr-3"></v-icon>
                    <div class="setting-content flex-grow-1">
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <div class="text-subtitle-2">仅在无下载任务时执行</div>
                          <div class="text-caption text-grey">避免在下载器繁忙时清理文件</div>
                        </div>
                        <v-switch
                          v-model="editableConfig.only_when_no_download"
                          color="warning"
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

          <!-- 定时任务设置 -->
          <v-card flat class="rounded mb-3 border config-card">
            <v-card-title class="text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5">
              <v-icon icon="mdi-clock-time-five" class="mr-2" color="primary" size="small" />
              <span>定时任务设置</span>
            </v-card-title>
            <v-card-text class="px-3 py-2">
              <!-- CRON表达式 -->
              <div class="mb-2">
                <VCronField
                  v-model="editableConfig.cron"
                  label="CRON表达式"
                  hint="设置垃圾文件清理的执行周期，如：0 4 * * * (每天凌晨4点)"
                  persistent-hint
                  density="compact"
                ></VCronField>
              </div>
              
              <!-- 扫描间隔 -->
              <div class="mt-3">
                <v-text-field
                  v-model.number="editableConfig.scan_interval"
                  label="监控扫描间隔(小时)"
                  type="number"
                  variant="outlined"
                  :min="1"
                  :max="168"
                  :rules="[v => v === null || v === '' || (Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 168) || '必须是1-168之间的整数']"
                  hint="目录大小监控的间隔时间，用于判断体积减少阈值"
                  persistent-hint
                  :disabled="saving"
                  density="compact"
                ></v-text-field>
                
                <div class="ml-2 mt-1 pa-2 rounded bg-blue-lighten-5">
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-information-outline" size="small" color="info" class="mr-2"></v-icon>
                    <span class="text-caption">
                      扫描间隔是系统记录目录大小变化的时间周期，对"体积减少目录"功能至关重要。系统会在每次清理时更新目录大小记录，当下次清理时发现目录大小减少超过阈值，就会判定为可清理目录。建议设置为与清理任务执行时间相同或更长。
                    </span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- 监控路径设置 -->
          <v-card flat class="rounded mb-3 border config-card">
            <v-card-title class="text-caption d-flex align-center justify-space-between px-3 py-2 bg-primary-lighten-5">
              <div class="d-flex align-center">
                <v-icon icon="mdi-folder-search" class="mr-2" color="primary" size="small" />
                <span>监控路径设置</span>
              </div>
              <v-btn
                size="x-small"
                color="primary"
                variant="text"
                prepend-icon="mdi-folder-plus"
                @click="showPathSelector = true"
                :disabled="saving"
              >
                添加路径
              </v-btn>
            </v-card-title>
            <v-card-text class="px-3 py-2">
              <v-alert v-if="!editableConfig.monitor_paths.length" density="compact" type="warning" variant="tonal" class="text-caption">
                未设置任何监控路径，请点击"添加路径"按钮添加需要清理的目录
              </v-alert>
              
              <!-- 监控路径列表 -->
              <div v-for="(path, index) in editableConfig.monitor_paths" :key="index" class="mb-2">
                <div class="d-flex align-items-center">
                  <v-text-field
                    v-model="editableConfig.monitor_paths[index]"
                    label="监控路径"
                    hint="文件夹路径"
                    persistent-hint
                    density="compact"
                    variant="outlined"
                    class="flex-grow-1"
                  ></v-text-field>
                  <v-btn
                    size="x-small"
                    color="error"
                    variant="text"
                    icon
                    @click="removePath(index)"
                    :disabled="saving"
                    class="ml-2"
                  >
                    <v-icon icon="mdi-delete" size="small" />
                  </v-btn>
                  <v-btn
                    size="x-small"
                    color="primary"
                    variant="text"
                    icon
                    @click="showPathSelector = true; currentPathIndex = index"
                    :disabled="saving"
                    class="ml-2"
                  >
                    <v-icon icon="mdi-folder-search" size="small" />
                  </v-btn>
                </div>
              </div>
              
              <!-- 添加路径按钮 -->
              <div class="d-flex justify-end mt-2">
                <v-btn
                  size="small"
                  color="primary"
                  variant="text"
                  prepend-icon="mdi-folder-plus"
                  @click="addEmptyPath"
                  :disabled="saving"
                >
                  添加路径
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <!-- 清理规则设置 -->
          <v-card flat class="rounded mb-3 border config-card">
            <v-card-title class="text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5">
              <v-icon icon="mdi-filter-settings" class="mr-2" color="primary" size="small" />
              <span>清理规则</span>
            </v-card-title>
            <v-card-text class="px-3 py-2">
              <v-row>
                <v-col cols="12" md="4">
                  <div class="setting-item d-flex align-center py-2">
                    <v-icon icon="mdi-folder-remove" size="small" :color="editableConfig.empty_dir_cleanup ? 'success' : 'grey'" class="mr-3"></v-icon>
                    <div class="setting-content flex-grow-1">
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <div class="text-subtitle-2">清理空目录</div>
                          <div class="text-caption text-grey">自动删除不包含任何文件的空文件夹</div>
                        </div>
                        <v-switch
                          v-model="editableConfig.empty_dir_cleanup"
                          color="success"
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
                
                <v-col cols="12" md="4">
                  <div class="setting-item d-flex align-center py-2">
                    <v-icon icon="mdi-weight" size="small" :color="editableConfig.small_dir_cleanup ? 'warning' : 'grey'" class="mr-3"></v-icon>
                    <div class="setting-content flex-grow-1">
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <div class="text-subtitle-2">清理小体积目录</div>
                          <div class="text-caption text-grey">清理小于指定体积的目录</div>
                        </div>
                        <v-switch
                          v-model="editableConfig.small_dir_cleanup"
                          color="warning"
                          inset
                          :disabled="saving"
                          density="compact"
                          hide-details
                          class="small-switch"
                        ></v-switch>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="editableConfig.small_dir_cleanup" class="ml-6 mt-1">
                    <v-text-field
                      v-model.number="editableConfig.small_dir_max_size"
                      label="小体积目录最大值(MB)"
                      type="number"
                      variant="outlined"
                      :min="1"
                      :max="1000"
                      :rules="[v => v === null || v === '' || (Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 1000) || '必须是1-1000之间的整数']"
                      :disabled="saving"
                      density="compact"
                    ></v-text-field>
                  </div>
                </v-col>
                
                <v-col cols="12" md="4">
                  <div class="setting-item d-flex align-center py-2">
                    <v-icon icon="mdi-chart-line-variant" size="small" :color="editableConfig.size_reduction_cleanup ? 'error' : 'grey'" class="mr-3"></v-icon>
                    <div class="setting-content flex-grow-1">
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <div class="text-subtitle-2">清理体积减少目录</div>
                          <div class="text-caption text-grey">清理体积减少超过阈值的目录</div>
                        </div>
                        <v-switch
                          v-model="editableConfig.size_reduction_cleanup"
                          color="error"
                          inset
                          :disabled="saving"
                          density="compact"
                          hide-details
                          class="small-switch"
                        ></v-switch>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="editableConfig.size_reduction_cleanup" class="ml-6 mt-1">
                    <v-text-field
                      v-model.number="editableConfig.size_reduction_threshold"
                      label="体积减少阈值(%)"
                      type="number"
                      variant="outlined"
                      :min="10"
                      :max="99"
                      :rules="[v => v === null || v === '' || (Number.isInteger(Number(v)) && Number(v) >= 10 && Number(v) <= 99) || '必须是10-99之间的整数']"
                      :disabled="saving"
                      density="compact"
                    ></v-text-field>
                    
                    <div class="mt-2 pa-2 rounded bg-error-lighten-5">
                      <div class="d-flex">
                        <v-icon icon="mdi-alert-circle-outline" size="small" color="error" class="mr-2 mt-1"></v-icon>
                        <div class="text-caption">
                          <strong>功能说明：</strong>系统会记录目录大小变化，当目录大小减少超过设定阈值时判定为可清理。例如：原始目录10GB，解压后删除压缩包，减少到1GB(减少90%)，即可被清理。适用于下载后处理的临时目录。<span class="text-error">此功能需配合"扫描间隔"使用！</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- 帮助信息卡片 -->
          <v-card flat class="rounded mb-3 border config-card">
            <v-card-text class="px-3 py-2">
              <div class="d-flex">
                <v-icon icon="mdi-information" color="info" class="mr-2" size="small"></v-icon>
                <div class="text-caption">
                  <p class="mb-1"><strong>垃圾文件清理插件</strong>可定期清理下载目录中不需要的文件，支持三种清理模式：</p>
                  <div class="d-flex flex-wrap ml-1">
                    <div class="mr-3 mb-1"><v-icon icon="mdi-folder-remove" size="x-small" color="success" class="mr-1"></v-icon><strong>空目录清理</strong></div>
                    <div class="mr-3 mb-1"><v-icon icon="mdi-weight" size="x-small" color="warning" class="mr-1"></v-icon><strong>小体积目录清理</strong></div>
                    <div class="mb-1"><v-icon icon="mdi-chart-line-variant" size="x-small" color="error" class="mr-1"></v-icon><strong>体积减少目录清理</strong></div>
                  </div>
                  <div class="mt-1 text-grey-darken-1">配置完成后，插件将按CRON设定定时执行。可设置仅在下载器空闲时执行，避免影响正常下载。</div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- 排除目录设置 -->
          <v-card flat class="rounded mb-3 border config-card">
            <v-card-title class="text-caption d-flex align-center justify-space-between px-3 py-2 bg-primary-lighten-5">
              <div class="d-flex align-center">
                <v-icon icon="mdi-folder-remove" class="mr-2" color="primary" size="small" />
                <span>排除目录设置</span>
              </div>
              <v-btn
                size="x-small"
                color="primary"
                variant="text"
                prepend-icon="mdi-folder-plus"
                @click="showExcludePathSelector = true"
                :disabled="saving"
              >
                添加排除目录
              </v-btn>
            </v-card-title>
            <v-card-text class="px-3 py-2">
              <v-alert v-if="!editableConfig.exclude_dirs.length" density="compact" type="info" variant="tonal" class="text-caption">
                未设置任何排除目录，可点击"添加排除目录"按钮添加需要排除的目录
              </v-alert>
              
              <!-- 排除目录列表 -->
              <div v-for="(path, index) in editableConfig.exclude_dirs" :key="index" class="mb-2">
                <div class="d-flex align-items-center">
                  <v-text-field
                    v-model="editableConfig.exclude_dirs[index]"
                    label="排除目录"
                    hint="不会被清理的文件夹路径"
                    persistent-hint
                    density="compact"
                    variant="outlined"
                    class="flex-grow-1"
                  ></v-text-field>
                  <v-btn
                    size="x-small"
                    color="error"
                    variant="text"
                    icon
                    @click="removeExcludeDir(index)"
                    :disabled="saving"
                    class="ml-2"
                  >
                    <v-icon icon="mdi-delete" size="small" />
                  </v-btn>
                  <v-btn
                    size="x-small"
                    color="primary"
                    variant="text"
                    icon
                    @click="showExcludePathSelector = true; currentExcludePathIndex = index"
                    :disabled="saving"
                    class="ml-2"
                  >
                    <v-icon icon="mdi-folder-search" size="small" />
                  </v-btn>
                </div>
              </div>
              
              <!-- 添加排除目录按钮 -->
              <div class="d-flex justify-end mt-2">
                <v-btn
                  size="small"
                  color="primary"
                  variant="text"
                  prepend-icon="mdi-folder-plus"
                  @click="addEmptyExcludeDir"
                  :disabled="saving"
                >
                  添加排除目录
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-form>
      </v-card-text>
      
      <v-divider></v-divider>
      
      <v-card-actions class="px-2 py-1">
        <v-btn color="info" @click="emit('switch')" prepend-icon="mdi-view-dashboard" :disabled="saving" variant="text" size="small">状态页</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="secondary" variant="text" @click="resetConfig" :disabled="!initialConfigLoaded || saving" prepend-icon="mdi-restore" size="small">重置</v-btn>
        <v-btn color="primary" :disabled="!isFormValid || saving" @click="saveConfig" :loading="saving" prepend-icon="mdi-content-save" variant="text" size="small">保存配置</v-btn>
        <v-btn color="grey" @click="emit('close')" prepend-icon="mdi-close" :disabled="saving" variant="text" size="small">关闭</v-btn>
      </v-card-actions>
    </v-card>
    
    <!-- 路径选择对话框 -->
    <v-dialog v-model="showPathSelector" max-width="800">
      <v-card>
        <v-card-title class="text-subtitle-1 d-flex align-center px-3 py-2 bg-primary-lighten-5">
          <v-icon icon="mdi-folder-search" class="mr-2" color="primary" />
          <span>选择监控路径</span>
        </v-card-title>
        
        <v-card-text class="px-3 py-2">
          <div v-if="pathSelectorLoading" class="d-flex justify-center my-3">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>
          
          <div v-else>
            <!-- 当前路径显示 -->
            <v-text-field
              v-model="currentPath"
              label="当前路径"
              variant="outlined"
              readonly
              density="compact"
              class="mb-2"
            ></v-text-field>
            
            <!-- 文件列表 -->
            <v-list class="border rounded" max-height="300px" overflow-y="auto">
              <v-list-item
                v-for="(item, index) in pathItems"
                :key="index"
                @click="navigateTo(item)"
                :disabled="item.type !== 'parent' && item.type !== 'dir' && item.type !== 'drive'"
                class="py-1"
              >
                <template v-slot:prepend>
                  <v-icon 
                    :icon="item.type === 'parent' ? 'mdi-arrow-up' : (item.type === 'dir' ? 'mdi-folder' : (item.type === 'drive' ? 'mdi-harddisk' : 'mdi-file'))" 
                    size="small" 
                    class="mr-2"
                    :color="item.type === 'parent' ? 'grey' : (item.type === 'dir' || item.type === 'drive' ? 'amber-darken-2' : 'blue')"
                  />
                </template>
                <v-list-item-title class="text-body-2">{{ item.name }}</v-list-item-title>
              </v-list-item>
              
              <v-list-item v-if="!pathItems.length" class="py-2 text-center">
                <v-list-item-title class="text-body-2 text-grey">该目录为空或访问受限</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
          
          <v-alert v-if="pathSelectorError" type="error" density="compact" class="mt-2 text-caption" variant="tonal">
            {{ pathSelectorError }}
          </v-alert>
        </v-card-text>
        
        <v-card-actions class="px-3 py-2">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="selectCurrentPath"
            :disabled="!currentPath || pathSelectorLoading"
            variant="text"
            size="small"
          >
            选择当前目录
          </v-btn>
          <v-btn
            color="grey"
            @click="showPathSelector = false"
            variant="text"
            size="small"
          >
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 排除目录路径选择对话框 -->
    <v-dialog v-model="showExcludePathSelector" max-width="800">
      <v-card>
        <v-card-title class="text-subtitle-1 d-flex align-center px-3 py-2 bg-primary-lighten-5">
          <v-icon icon="mdi-folder-search" class="mr-2" color="primary" />
          <span>选择排除目录</span>
        </v-card-title>
        
        <v-card-text class="px-3 py-2">
          <div v-if="pathSelectorLoading" class="d-flex justify-center my-3">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>
          
          <div v-else>
            <!-- 当前路径显示 -->
            <v-text-field
              v-model="currentPath"
              label="当前路径"
              variant="outlined"
              readonly
              density="compact"
              class="mb-2"
            ></v-text-field>
            
            <!-- 文件列表 -->
            <v-list class="border rounded" max-height="300px" overflow-y="auto">
              <v-list-item
                v-for="(item, index) in pathItems"
                :key="index"
                @click="navigateTo(item)"
                :disabled="item.type !== 'parent' && item.type !== 'dir' && item.type !== 'drive'"
                class="py-1"
              >
                <template v-slot:prepend>
                  <v-icon 
                    :icon="item.type === 'parent' ? 'mdi-arrow-up' : (item.type === 'dir' ? 'mdi-folder' : (item.type === 'drive' ? 'mdi-harddisk' : 'mdi-file'))" 
                    size="small" 
                    class="mr-2"
                    :color="item.type === 'parent' ? 'grey' : (item.type === 'dir' || item.type === 'drive' ? 'amber-darken-2' : 'blue')"
                  />
                </template>
                <v-list-item-title class="text-body-2">{{ item.name }}</v-list-item-title>
              </v-list-item>
              
              <v-list-item v-if="!pathItems.length" class="py-2 text-center">
                <v-list-item-title class="text-body-2 text-grey">该目录为空或访问受限</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
          
          <v-alert v-if="pathSelectorError" type="error" density="compact" class="mt-2 text-caption" variant="tonal">
            {{ pathSelectorError }}
          </v-alert>
        </v-card-text>
        
        <v-card-actions class="px-3 py-2">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="selectExcludePath"
            :disabled="!currentPath || pathSelectorLoading"
            variant="text"
            size="small"
          >
            选择当前目录
          </v-btn>
          <v-btn
            color="grey"
            @click="showExcludePathSelector = false"
            variant="text"
            size="small"
          >
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, toRefs, computed, watch, onMounted } from 'vue';

export default defineComponent({
  name: 'Config',
  
  props: {
    api: {
      type: [Object, Function],
      required: true
    },
    initialConfig: {
      type: Object,
      default: () => ({})
    }
  },
  
  emits: ['switch', 'close', 'save'],
  
  setup(props, { emit }) {
    // 状态
    const state = reactive({
      error: null,
      successMessage: null,
      saving: false,
      isFormValid: true,
      initialConfigLoaded: false,
      editableConfig: {
        enable: false,
        notify: true,
        cron: '0 4 * * *',
        only_when_no_download: true,
        monitor_paths: [],
        empty_dir_cleanup: true,
        small_dir_cleanup: false,
        small_dir_max_size: 10,
        size_reduction_cleanup: false,
        size_reduction_threshold: 80,
        scan_interval: 24,
        exclude_dirs: []
      },
      originalConfig: null,
      
      // 路径选择器相关
      showPathSelector: false,
      showExcludePathSelector: false,
      currentPath: '',
      currentPathIndex: -1, // 当前编辑的路径索引
      currentExcludePathIndex: -1, // 当前编辑的排除目录索引
      pathItems: [],
      pathSelectorLoading: false,
      pathSelectorError: null,
      
      // 下载器状态相关
      downloaders: [],
      downloadersLoading: false
    });
    
    // 初始化配置
    const initConfig = () => {
      if (props.initialConfig) {
        // 深拷贝配置对象防止引用问题
        state.editableConfig = JSON.parse(JSON.stringify(props.initialConfig));
        state.originalConfig = JSON.parse(JSON.stringify(props.initialConfig));
        
        // 确保exclude_dirs是数组
        if (!Array.isArray(state.editableConfig.exclude_dirs)) {
          state.editableConfig.exclude_dirs = [];
        }
        
        // 确保monitor_paths是数组
        if (!Array.isArray(state.editableConfig.monitor_paths)) {
          state.editableConfig.monitor_paths = [];
        }
        
        state.initialConfigLoaded = true;
        
        // 如果启用了仅在无下载任务时执行，获取下载器状态
        if (state.editableConfig.only_when_no_download) {
          loadDownloaderStatus();
        }
      }
    };
    
    // 加载配置
    const loadConfig = async () => {
      try {
        state.error = null;
        const response = await props.api.get('plugin/TrashClean/config');
        if (response) {
          // 深拷贝配置对象以防引用问题
          state.editableConfig = JSON.parse(JSON.stringify(response));
          state.originalConfig = JSON.parse(JSON.stringify(response));
          
          // 确保exclude_dirs是数组
          if (!Array.isArray(state.editableConfig.exclude_dirs)) {
            state.editableConfig.exclude_dirs = [];
          }
          
          // 确保monitor_paths是数组
          if (!Array.isArray(state.editableConfig.monitor_paths)) {
            state.editableConfig.monitor_paths = [];
          }
          
          state.initialConfigLoaded = true;
          
          // 如果启用了仅在无下载任务时执行，获取下载器状态
          if (state.editableConfig.only_when_no_download) {
            loadDownloaderStatus();
          }
        }
      } catch (error) {
        state.error = `加载配置失败: ${error.message || error}`;
        console.error('加载配置失败:', error);
      }
    };
    
    // 保存配置
    const saveConfig = async () => {
      try {
        state.error = null;
        state.successMessage = null;
        state.saving = true;
        
        // 确保配置对象中包含所有必要的字段
        const configToSave = {
          enable: state.editableConfig.enable,
          notify: state.editableConfig.notify,
          cron: state.editableConfig.cron,
          only_when_no_download: state.editableConfig.only_when_no_download,
          monitor_paths: state.editableConfig.monitor_paths.filter(path => path && path.trim()),
          empty_dir_cleanup: state.editableConfig.empty_dir_cleanup,
          small_dir_cleanup: state.editableConfig.small_dir_cleanup,
          small_dir_max_size: parseInt(state.editableConfig.small_dir_max_size) || 10,
          size_reduction_cleanup: state.editableConfig.size_reduction_cleanup,
          size_reduction_threshold: parseInt(state.editableConfig.size_reduction_threshold) || 80,
          scan_interval: parseInt(state.editableConfig.scan_interval) || 24,
          exclude_dirs: state.editableConfig.exclude_dirs || []
        };
        
        // 验证必填字段
        if (configToSave.small_dir_cleanup && (!configToSave.small_dir_max_size || configToSave.small_dir_max_size <= 0)) {
          state.error = "小体积目录最大值必须大于0";
          state.saving = false;
          return;
        }
        
        if (configToSave.size_reduction_cleanup && (!configToSave.size_reduction_threshold || configToSave.size_reduction_threshold <= 0)) {
          state.error = "体积减少阈值必须大于0";
          state.saving = false;
          return;
        }
        
        // 向父组件发送保存事件
        emit('save', configToSave);
        
        const response = await props.api.post('plugin/TrashClean/config', configToSave);
        
        if (response && response.status === 'success') {
          state.successMessage = '配置保存成功';
          // 更新原始配置
          state.originalConfig = JSON.parse(JSON.stringify(configToSave));
          state.editableConfig = JSON.parse(JSON.stringify(configToSave));
          
          // 如果启用了仅在无下载任务时执行，获取下载器状态
          if (state.editableConfig.only_when_no_download) {
            loadDownloaderStatus();
          }
          
          // 3秒后清除成功消息
          setTimeout(() => {
            state.successMessage = null;
          }, 3000);
        } else {
          state.error = response?.message || '配置保存失败';
        }
      } catch (error) {
        state.error = `配置保存失败: ${error.message || error}`;
        console.error('配置保存失败:', error);
      } finally {
        state.saving = false;
      }
    };
    
    // 重置配置
    const resetConfig = () => {
      if (state.originalConfig) {
        state.editableConfig = JSON.parse(JSON.stringify(state.originalConfig));
      }
    };
    
    // 移除排除目录
    const removeExcludeDir = (index) => {
      state.editableConfig.exclude_dirs.splice(index, 1);
    };
    
    // 添加空的监控路径
    const addEmptyPath = () => {
      state.editableConfig.monitor_paths.push('');
    };
    
    // 添加监控路径
    const addPath = (path) => {
      if (path && !state.editableConfig.monitor_paths.includes(path)) {
        state.editableConfig.monitor_paths.push(path);
      }
    };
    
    // 移除监控路径
    const removePath = (index) => {
      state.editableConfig.monitor_paths.splice(index, 1);
    };
    
    // 设置监控路径
    const setPath = (index, path) => {
      if (index >= 0 && index < state.editableConfig.monitor_paths.length) {
        state.editableConfig.monitor_paths[index] = path;
      }
    };
    
    // 加载下载器状态
    const loadDownloaderStatus = async () => {
      try {
        state.downloadersLoading = true;
        // 获取所有下载器及其活动状态
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
        state.downloadersLoading = false;
      }
    };
    
    // 路径选择器相关
    const browseDirectory = async (path = null) => {
      try {
        state.pathSelectorLoading = true;
        state.pathSelectorError = null;
        
        // 使用MoviePilot的文件管理API
        const response = await props.api.post('storage/list', {
          path: path || '/',
          type: 'share', // 使用默认的share类型
          flag: 'ROOT'
        });
        
        if (response && Array.isArray(response)) {
          state.currentPath = path || '/';
          state.pathItems = response.map(item => ({
            name: item.name,
            path: item.path,
            type: item.type === 'dir' ? 'dir' : 'file'
          }));
          
          // 添加上级目录（如果不是根目录）
          if (path && path !== '/') {
            const parentPath = path.split('/').slice(0, -1).join('/') || '/';
            state.pathItems.unshift({
              name: '..',
              path: parentPath,
              type: 'parent'
            });
          }
        } else {
          state.pathSelectorError = '浏览目录失败：无效响应';
          state.pathItems = [];
        }
      } catch (error) {
        state.pathSelectorError = `浏览目录失败: ${error.message || error}`;
        state.pathItems = [];
        console.error('浏览目录失败:', error);
      } finally {
        state.pathSelectorLoading = false;
      }
    };
    
    // 导航到指定目录
    const navigateTo = (item) => {
      if (item && (item.type === 'dir' || item.type === 'drive' || item.type === 'parent')) {
        browseDirectory(item.path);
      }
    };
    
    // 选择当前目录作为监控路径
    const selectCurrentPath = () => {
      if (state.currentPath) {
        if (state.currentPathIndex >= 0) {
          // 更新现有路径
          setPath(state.currentPathIndex, state.currentPath);
        } else {
          // 添加新路径
          addPath(state.currentPath);
        }
        state.showPathSelector = false;
        state.currentPathIndex = -1;
      }
    };
    
    // 选择当前目录作为排除目录
    const selectExcludePath = () => {
      if (state.currentPath) {
        // 添加到排除目录
        if (!state.editableConfig.exclude_dirs) {
          state.editableConfig.exclude_dirs = [];
        }
        
        if (state.currentExcludePathIndex >= 0) {
          // 更新现有的排除目录
          state.editableConfig.exclude_dirs[state.currentExcludePathIndex] = state.currentPath;
        } else if (!state.editableConfig.exclude_dirs.includes(state.currentPath)) {
          // 添加新的排除目录
          state.editableConfig.exclude_dirs.push(state.currentPath);
        }
        
        state.currentExcludePathIndex = -1;
        state.showExcludePathSelector = false;
      }
    };
    
    // 添加空的排除目录
    const addEmptyExcludeDir = () => {
      if (!state.editableConfig.exclude_dirs) {
        state.editableConfig.exclude_dirs = [];
      }
      state.editableConfig.exclude_dirs.push('');
    };
    
    // 监听路径选择器的显示状态
    watch(() => state.showPathSelector, (newVal) => {
      if (newVal) {
        // 显示路径选择器时，加载目录列表
        browseDirectory();
      }
    });
    
    // 监听排除目录路径选择器的显示状态
    watch(() => state.showExcludePathSelector, (newVal) => {
      if (newVal) {
        // 显示排除目录路径选择器时，加载目录列表
        browseDirectory();
      }
    });
    
    // 监听只在无下载任务时执行开关
    watch(() => state.editableConfig.only_when_no_download, (newVal) => {
      if (newVal) {
        loadDownloaderStatus();
      }
    });
    
    // 组件创建时，初始化配置
    onMounted(() => {
      initConfig();
      
      // 如果没有初始配置，尝试加载
      if (!Object.keys(props.initialConfig || {}).length) {
        loadConfig();
      }
    });
    
    return {
      ...toRefs(state),
      saveConfig,
      resetConfig,
      removeExcludeDir,
      addEmptyPath,
      addPath,
      removePath,
      setPath,
      loadDownloaderStatus,
      browseDirectory,
      navigateTo,
      selectCurrentPath,
      selectExcludePath,
      addEmptyExcludeDir,
      emit
    };
  }
});
</script>

<style scoped>
.config-card {
  box-shadow: none !important;
}

.small-switch :deep(.v-switch__track) {
  opacity: 0.3;
}

.small-switch :deep(.v-switch__thumb) {
  transition: transform 0.15s;
}
</style> 