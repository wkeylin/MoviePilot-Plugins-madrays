<template>
  <div class="plugin-page">
    <v-card flat class="rounded border">
      <!-- 标题区域 -->
      <v-card-title class="text-subtitle-1 d-flex align-center px-3 py-2 bg-primary-lighten-5">
        <v-icon icon="mdi-broom" class="mr-2" color="primary" size="small" />
        <span>垃圾文件清理</span>
      </v-card-title>
      
      <!-- 通知区域 -->
      <v-card-text class="px-3 py-2">
        <v-alert v-if="error" type="error" density="compact" class="mb-2 text-caption" variant="tonal" closable>{{ error }}</v-alert>
        <v-alert v-if="actionMessage" :type="actionMessageType" density="compact" class="mb-2 text-caption" variant="tonal" closable>{{ actionMessage }}</v-alert>
        
        <v-skeleton-loader v-if="loading && !initialDataLoaded" type="article, actions"></v-skeleton-loader>

        <div v-if="initialDataLoaded" class="my-1">
          <!-- 状态卡片 -->
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
                  </v-list>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions class="px-3 py-2">
                  <!-- 移除手动清理按钮，已移到底部操作栏 -->
                </v-card-actions>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="6">
              <!-- 监控路径状态 -->
              <v-card flat class="rounded mb-3 border config-card">
                <v-card-title class="text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5">
                  <v-icon icon="mdi-folder-search" class="mr-2" color="primary" size="small" />
                  <span>监控路径</span>
                  <v-chip class="ml-1" size="x-small" color="info" variant="flat">{{ pathStats.length || 0 }} 个路径</v-chip>
                </v-card-title>
                <v-card-text class="pa-0">
                  <div v-if="!pathStats.length" class="text-center text-grey py-3">
                    <v-icon icon="mdi-folder-off" size="small" class="mb-1" />
                    <div class="text-caption">未设置任何监控路径</div>
                  </div>
                  <v-list v-else class="pa-0 bg-transparent" density="compact">
                    <v-list-item
                      v-for="(path, index) in pathStats"
                      :key="index"
                      class="px-3 py-1"
                    >
                      <template v-slot:prepend>
                        <v-icon
                          :icon="path.exists ? 'mdi-folder' : 'mdi-folder-off'"
                          :color="path.exists ? 'amber-darken-2' : 'grey'"
                          size="small"
                          class="mr-2"
                        />
                      </template>
                      <v-list-item-title class="text-caption">{{ path.path }}</v-list-item-title>
                      <template v-slot:append>
                        <v-chip
                          size="x-small"
                          :color="path.exists ? (path.status === 'valid' ? 'success' : 'error') : 'grey'"
                          variant="flat"
                        >
                          {{ path.exists ? (path.status === 'valid' ? '可用' : '错误') : '不存在' }}
                        </v-chip>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
              
              <!-- 排除目录状态 -->
              <v-card flat class="rounded mb-3 border config-card">
                <v-card-title class="text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5">
                  <v-icon icon="mdi-folder-remove" class="mr-2" color="primary" size="small" />
                  <span>排除目录</span>
                  <v-chip class="ml-1" size="x-small" color="info" variant="flat">{{ statusData.exclude_dirs?.length || 0 }} 个目录</v-chip>
                </v-card-title>
                <v-card-text class="pa-0">
                  <div v-if="!statusData.exclude_dirs?.length" class="text-center text-grey py-3">
                    <v-icon icon="mdi-folder-off" size="small" class="mb-1" />
                    <div class="text-caption">未设置任何排除目录</div>
                  </div>
                  <v-list v-else class="pa-0 bg-transparent" density="compact">
                    <v-list-item
                      v-for="(path, index) in statusData.exclude_dirs"
                      :key="index"
                      class="px-3 py-1"
                    >
                      <template v-slot:prepend>
                        <v-icon
                          icon="mdi-folder-remove"
                          color="error"
                          size="small"
                          class="mr-2"
                        />
                      </template>
                      <v-list-item-title class="text-caption">{{ path }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- 下载器监控状态 -->
          <v-card v-if="statusData.only_when_no_download" flat class="rounded mb-3 border config-card">
            <v-card-title class="text-caption d-flex align-center justify-space-between px-3 py-2 bg-primary-lighten-5">
              <div class="d-flex align-center">
                <v-icon icon="mdi-download-network" class="mr-2" color="primary" size="small" />
                <span>下载器监控状态</span>
              </div>
              <v-chip size="x-small" :color="downloadersHaveActiveTasks ? 'warning' : 'success'" variant="flat">
                {{ downloadersHaveActiveTasks ? '有活动任务' : '无活动任务' }}
              </v-chip>
            </v-card-title>
            <v-card-text class="pa-0">
              <div v-if="loadingDownloaders" class="d-flex justify-center py-4">
                <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
              </div>
              <div v-else-if="!downloaders.length" class="text-center text-grey py-3">
                <v-icon icon="mdi-download-off" size="small" class="mb-1" />
                <div class="text-caption">未找到可用的下载器</div>
              </div>
              <div v-else>
                <div class="downloader-grid pa-2">
                  <v-card
                    v-for="(downloader, index) in downloaders"
                    :key="index"
                    :color="downloader.hasActiveTasks ? 'warning-lighten-5' : 'success-lighten-5'"
                    class="downloader-card"
                    flat
                    rounded
                    elevation="0"
                  >
                    <div class="d-flex align-center px-3 py-2">
                      <v-avatar size="40" :color="downloader.hasActiveTasks ? 'warning-lighten-4' : 'success-lighten-4'" class="mr-3">
                        <v-icon
                          :icon="downloader.hasActiveTasks ? 'mdi-download' : 'mdi-check-circle'"
                          :color="downloader.hasActiveTasks ? 'warning-darken-1' : 'success-darken-1'"
                        />
                      </v-avatar>
                      <div>
                        <div class="font-weight-medium">{{ downloader.name }}</div>
                        <div class="text-caption">{{ downloader.hasActiveTasks ? `${downloader.count || '0'} 个活动任务` : '空闲' }}</div>
                      </div>
                      <v-spacer></v-spacer>
                      <v-chip
                        size="small"
                        :color="downloader.hasActiveTasks ? 'warning' : 'success'"
                        variant="tonal"
                        class="ml-2"
                      >
                        {{ downloader.hasActiveTasks ? '运行中' : '可清理' }}
                      </v-chip>
                    </div>
                    
                    <!-- 添加活动种子列表 -->
                    <template v-if="downloader.hasActiveTasks && downloader.activeTasks && downloader.activeTasks.length > 0">
                      <v-divider></v-divider>
                      <v-expansion-panels variant="accordion" class="mt-1">
                        <v-expansion-panel>
                          <v-expansion-panel-title class="py-1 px-3" density="compact">
                            <div class="d-flex align-center">
                              <v-icon icon="mdi-download-network" size="small" class="mr-1"></v-icon>
                              <span>活动任务 ({{ downloader.count }})</span>
                            </div>
                          </v-expansion-panel-title>
                          <v-expansion-panel-text class="py-1 px-0">
                            <div class="tasks-container">
                              <div
                                v-for="(task, taskIndex) in downloader.activeTasks"
                                :key="taskIndex"
                                class="task-item py-2 px-3"
                              >
                                <div class="d-flex align-center mb-1">
                                  <v-icon icon="mdi-download" size="small" class="mr-2" color="warning"></v-icon>
                                  <div class="text-subtitle-2 text-truncate" :title="task.name">{{ task.name }}</div>
                                </div>
                                <div class="task-info d-flex align-center justify-space-between mt-1">
                                  <v-progress-linear
                                    v-model="task.progress"
                                    color="warning"
                                    height="6"
                                    class="rounded-lg flex-grow-1"
                                  ></v-progress-linear>
                                  <span class="text-caption progress-value ml-2">{{ task.progress.toFixed(1) }}%</span>
                                </div>
                                <div class="task-details d-flex flex-wrap justify-space-between mt-2">
                                  <span class="info-chip">
                                    <v-icon icon="mdi-speedometer" size="x-small" class="mr-1"></v-icon>
                                    {{ formatSpeed(task.dlspeed) }}
                                  </span>
                                  <span class="info-chip">
                                    <v-icon icon="mdi-clock-outline" size="x-small" class="mr-1"></v-icon>
                                    {{ formatETA(task.eta) }}
                                  </span>
                                  <span class="info-chip">
                                    <v-icon icon="mdi-harddisk" size="x-small" class="mr-1"></v-icon>
                                    {{ formatSize(task.size) }}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </v-expansion-panel-text>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </template>
                  </v-card>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- 清理规则状态 -->
          <v-card flat class="rounded mb-3 border config-card">
            <v-card-title class="text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5">
              <v-icon icon="mdi-filter-settings" class="mr-2" color="primary" size="small" />
              <span>清理规则</span>
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list class="bg-transparent pa-0">
                <v-list-item class="px-3 py-1">
                  <template v-slot:prepend>
                    <v-icon 
                      :color="cleanupRules.empty_dir ? 'success' : 'grey'" 
                      icon="mdi-folder-remove" 
                      size="small" 
                    />
                  </template>
                  <v-list-item-title class="text-caption">清理空目录</v-list-item-title>
                  <template v-slot:append>
                    <v-chip
                      :color="cleanupRules.empty_dir ? 'success' : 'grey'"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ cleanupRules.empty_dir ? '已启用' : '已禁用' }}
                    </v-chip>
                  </template>
                </v-list-item>
                <v-divider class="my-1"></v-divider>
                <v-list-item class="px-3 py-1">
                  <template v-slot:prepend>
                    <v-icon 
                      :color="cleanupRules.small_dir.enabled ? 'warning' : 'grey'" 
                      icon="mdi-weight" 
                      size="small" 
                    />
                  </template>
                  <v-list-item-title class="text-caption">清理小体积目录</v-list-item-title>
                  <template v-slot:append>
                    <span v-if="cleanupRules.small_dir.enabled" class="text-caption mr-2">
                      最大体积 {{ cleanupRules.small_dir.max_size }}MB
                    </span>
                    <v-chip
                      :color="cleanupRules.small_dir.enabled ? 'warning' : 'grey'"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ cleanupRules.small_dir.enabled ? '已启用' : '已禁用' }}
                    </v-chip>
                  </template>
                </v-list-item>
                <v-divider class="my-1"></v-divider>
                <v-list-item class="px-3 py-1">
                  <template v-slot:prepend>
                    <v-icon 
                      :color="cleanupRules.size_reduction.enabled ? 'error' : 'grey'" 
                      icon="mdi-chart-line-variant" 
                      size="small" 
                    />
                  </template>
                  <v-list-item-title class="text-caption">清理体积减少目录</v-list-item-title>
                  <template v-slot:append>
                    <span v-if="cleanupRules.size_reduction.enabled" class="text-caption mr-2">
                      减少阈值 {{ cleanupRules.size_reduction.threshold }}%
                    </span>
                    <v-chip
                      :color="cleanupRules.size_reduction.enabled ? 'error' : 'grey'"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ cleanupRules.size_reduction.enabled ? '已启用' : '已禁用' }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
          
          <!-- 目录详细统计 -->
          <v-card v-if="pathStats.length" flat class="rounded mb-3 border config-card">
            <v-card-title class="text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5">
              <v-icon icon="mdi-chart-bar" class="mr-2" color="primary" size="small" />
              <span>目录统计</span>
            </v-card-title>
            <v-card-text class="pa-0">
              <v-table density="compact" class="text-body-2">
                <thead>
                  <tr>
                    <th class="text-body-2 font-weight-bold">路径</th>
                    <th class="text-body-2 font-weight-bold text-center">总大小</th>
                    <th class="text-body-2 font-weight-bold text-center">文件数</th>
                    <th class="text-body-2 font-weight-bold text-center">子目录数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(path, index) in validPathStats" :key="index">
                    <td>
                      <div class="d-flex align-center">
                        <v-icon icon="mdi-folder" size="small" color="amber-darken-2" class="mr-2" />
                        <span class="text-truncate" style="max-width: 300px;">{{ path.path }}</span>
                      </div>
                    </td>
                    <td class="text-center">{{ formatSize(path.total_size_bytes) }}</td>
                    <td class="text-center">{{ path.file_count }}</td>
                    <td class="text-center">{{ path.dir_count }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
          
          <!-- 清理历史记录卡片 -->
          <v-card flat class="rounded mb-3 border config-card" v-if="cleanResult">
            <v-card-title class="text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5">
              <v-icon icon="mdi-history" class="mr-2" color="primary" size="small" />
              <span>最近清理记录</span>
              <v-chip size="x-small" color="success" variant="flat" class="ml-2">
                {{ formatDate(new Date()) }}
              </v-chip>
            </v-card-title>
            <v-card-text class="pa-0">
              <v-alert 
                :type="cleanResult.status === 'success' ? 'success' : 'error'" 
                variant="tonal" 
                density="compact" 
                class="ma-2"
              >
                {{ cleanResult.status === 'success' ? 
                  `清理成功，共删除 ${cleanResult.removed_dirs.length} 个目录，释放 ${cleanResult.total_freed_space.toFixed(2)}MB 空间` : 
                  cleanResult.message || '清理失败' }}
              </v-alert>
              
              <div v-if="cleanResult.status === 'success' && cleanResult.removed_dirs.length">
                <v-card flat class="ma-2 px-2 py-1 bg-grey-lighten-5">
                  <div class="d-flex align-center px-2 py-1">
                    <v-icon icon="mdi-information-outline" size="small" color="info" class="mr-2"></v-icon>
                    <span class="text-caption">按类型统计：空目录({{ cleanResult.removed_empty_dirs_count }})、小体积目录({{ cleanResult.removed_small_dirs_count }})、体积减少目录({{ cleanResult.removed_size_reduction_dirs_count }})</span>
                  </div>
                </v-card>
                
                <div class="my-2 px-3">
                  <div class="text-subtitle-2 font-weight-medium">已删除的目录：</div>
                </div>
                
                <v-list density="compact" class="pa-0">
                  <v-list-item
                    v-for="(dir, index) in cleanResult.removed_dirs"
                    :key="index"
                    class="clean-history-item"
                  >
                    <template v-slot:prepend>
                      <v-avatar :color="getCleanTypeColor(dir.type) + '-lighten-4'" size="28" class="mr-2">
                        <v-icon 
                          :icon="getCleanTypeIcon(dir.type)" 
                          size="small" 
                          :color="getCleanTypeColor(dir.type)" 
                        />
                      </v-avatar>
                    </template>
                    
                    <v-list-item-title class="text-body-2 clean-dir-path">
                      {{ dir.path }}
                    </v-list-item-title>
                    
                    <template v-slot:append>
                      <div class="d-flex align-center">
                        <span v-if="dir.type === 'small'" class="text-caption mr-2">{{ dir.size.toFixed(2) }}MB</span>
                        <span v-if="dir.type === 'size_reduction'" class="text-caption mr-2">减少{{ dir.reduction_percent.toFixed(0) }}%</span>
                        <v-chip
                          size="x-small"
                          :color="getCleanTypeColor(dir.type)"
                          variant="flat"
                          class="clean-type-chip"
                        >
                          {{ getCleanTypeText(dir.type) }}
                        </v-chip>
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
              
              <div v-else-if="cleanResult.status === 'success' && cleanResult.removed_dirs.length === 0" class="text-center py-3">
                <v-icon icon="mdi-information-outline" size="large" color="info" class="mb-2" />
                <div>没有符合清理条件的目录</div>
              </div>
            </v-card-text>
          </v-card>
          
          <!-- 清理历史 -->
          <v-card flat class="rounded mb-3 border config-card">
            <v-card-title class="text-caption d-flex align-center px-3 py-2 bg-primary-lighten-5">
              <v-icon icon="mdi-history" class="mr-2" color="primary" size="small" />
              <span>清理历史</span>
            </v-card-title>
            <v-card-text class="px-3 py-2">
              <div v-if="!cleanHistory.length" class="text-center text-grey py-1">
                <v-icon icon="mdi-information-outline" size="small" class="mb-1" />
                <div class="text-caption">暂无清理历史记录</div>
              </div>
              <v-timeline v-else density="compact" align="start" truncate-line="both" class="mt-0">
                <v-timeline-item 
                  v-for="(item, index) in cleanHistory.slice(0, 3)" 
                  :key="index"
                  :dot-color="getHistoryColor(index)"
                  size="x-small"
                >
                  <template v-slot:icon>
                    <v-icon size="x-small">mdi-broom</v-icon>
                  </template>
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption text-grey-darken-2">{{ formatDate(new Date(item.last_update)) }}</span>
                    <v-chip size="x-small" :color="getHistoryColor(index)" variant="flat">
                      #{{ index + 1 }}
                    </v-chip>
                  </div>
                  <div class="text-caption">
                    清理 <strong>{{ item.removed_dirs.length }}</strong> 个目录
                    (释放 {{ item.total_freed_space.toFixed(2) }}MB)
                  </div>
                </v-timeline-item>
                <v-timeline-item v-if="cleanHistory.length > 3" dot-color="primary" size="x-small">
                  <template v-slot:icon>
                    <v-icon size="x-small">mdi-dots-horizontal</v-icon>
                  </template>
                  <div class="text-caption d-flex align-center">
                    <span class="text-grey">还有 {{ cleanHistory.length - 3 }} 条历史记录</span>
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
          
          <!-- 帮助信息卡片 -->
          <v-card flat class="rounded mb-3 border config-card">
            <v-card-text class="d-flex align-center px-3 py-2">
              <v-icon icon="mdi-information" color="info" class="mr-2" size="small"></v-icon>
              <span class="text-caption">
                点击"配置"按钮可设置清理策略和监控目录。点击"立即清理"按钮可立即执行清理任务。
              </span>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
      
      <v-divider></v-divider>
      
      <v-card-actions class="px-2 py-1">
        <v-btn color="info" @click="refreshData" prepend-icon="mdi-refresh" :disabled="refreshing" :loading="refreshing" variant="text" size="small">刷新数据</v-btn>
        <v-spacer></v-spacer>
        <v-btn 
          color="success" 
          @click="triggerClean" 
          :loading="actionLoading" 
          :disabled="actionLoading" 
          prepend-icon="mdi-broom" 
          variant="text" 
          size="small"
        >
          立即清理
        </v-btn>
        <v-btn color="primary" @click="emit('switch')" prepend-icon="mdi-cog" variant="text" size="small">配置</v-btn>
        <v-btn color="grey" @click="emit('close')" prepend-icon="mdi-close" variant="text" size="small">关闭</v-btn>
      </v-card-actions>
    </v-card>
    
    <!-- 清理结果对话框 -->
    <v-dialog v-model="showCleanResultDialog" max-width="600">
      <v-card>
        <v-card-title class="text-subtitle-1 d-flex align-center px-3 py-2 bg-primary-lighten-5">
          <v-icon icon="mdi-broom" class="mr-2" color="primary" />
          <span>清理结果</span>
        </v-card-title>
        
        <v-card-text class="px-3 py-2">
          <div v-if="cleanResult">
            <v-alert 
              :type="cleanResult.status === 'success' ? 'success' : 'error'" 
              variant="tonal" 
              density="compact" 
              class="mb-3"
            >
              {{ cleanResult.status === 'success' ? 
                `清理成功，共删除 ${cleanResult.removed_dirs.length} 个目录，释放 ${cleanResult.total_freed_space.toFixed(2)}MB 空间` : 
                cleanResult.message || '清理失败' }}
            </v-alert>
            
            <div v-if="cleanResult.status === 'success' && cleanResult.removed_dirs.length">
              <div class="text-subtitle-2 mb-2">已删除的目录：</div>
              <v-list density="compact" class="bg-grey-lighten-5 rounded">
                <v-list-item
                  v-for="(dir, index) in cleanResult.removed_dirs"
                  :key="index"
                  class="py-1"
                >
                  <template v-slot:prepend>
                    <v-icon 
                      icon="mdi-folder-remove" 
                      size="small" 
                      :color="getCleanTypeColor(dir.type)" 
                      class="mr-2" 
                    />
                  </template>
                  <v-list-item-title class="text-caption">{{ dir.path }}</v-list-item-title>
                  <template v-slot:append>
                    <v-chip
                      size="x-small"
                      :color="getCleanTypeColor(dir.type)"
                      variant="flat"
                    >
                      {{ getCleanTypeText(dir.type) }}
                      {{ dir.type === 'size_reduction' ? `(${dir.reduction_percent.toFixed(0)}%)` : 
                         dir.type === 'small' ? `(${dir.size.toFixed(2)}MB)` : '' }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </div>
            
            <div v-if="cleanResult.status === 'success' && cleanResult.removed_dirs.length === 0" class="text-center py-2">
              <v-icon icon="mdi-information-outline" size="large" color="info" class="mb-2" />
              <div>没有符合清理条件的目录</div>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="px-3 py-2">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="showCleanResultDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 历史记录对话框 -->
    <v-dialog v-model="showHistoryDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-subtitle-1 d-flex align-center px-4 py-3 bg-primary-lighten-5">
          <v-icon icon="mdi-history" class="mr-2" color="primary" />
          <span>清理历史记录</span>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-timeline v-if="cleanHistory.length" density="compact" align="start">
            <v-timeline-item 
              v-for="(item, index) in cleanHistory" 
              :key="index"
              :dot-color="getHistoryColor(index)"
              size="small"
            >
              <template v-slot:icon>
                <v-icon size="x-small">mdi-broom</v-icon>
              </template>
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-caption font-weight-medium">{{ formatDate(new Date(item.last_update)) }}</span>
                <v-chip size="x-small" :color="getHistoryColor(index)" variant="flat">
                  #{{ index + 1 }}
                </v-chip>
              </div>
              <div class="text-body-2">
                清理 <strong>{{ item.removed_dirs.length }}</strong> 个目录
                (释放 {{ item.total_freed_space.toFixed(2) }}MB 空间)
              </div>
              <div class="d-flex flex-wrap text-caption mt-1">
                <v-chip size="x-small" color="success" variant="flat" class="mr-1 mb-1">
                  空目录: {{ item.removed_empty_dirs_count }}
                </v-chip>
                <v-chip size="x-small" color="warning" variant="flat" class="mr-1 mb-1">
                  小体积目录: {{ item.removed_small_dirs_count }}
                </v-chip>
                <v-chip size="x-small" color="error" variant="flat" class="mb-1">
                  体积减少目录: {{ item.removed_size_reduction_dirs_count }}
                </v-chip>
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

<script>
import { defineComponent, ref, reactive, toRefs, computed, onMounted } from 'vue';

export default defineComponent({
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
</script>

<style>
.config-card {
  box-shadow: none !important;
}

.downloaders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.downloader-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border-radius: 8px;
  overflow: hidden;
}

.downloader-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.clean-history-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease;
}

.clean-history-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.clean-dir-path {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.clean-type-chip {
  font-weight: 500;
}

.history-row:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.directory-path {
  max-width: 350px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

.time-highlight {
  color: #1976d2;
}

.downloader-item {
  transition: background-color 0.2s ease;
}

.downloader-item.has-tasks {
  background-color: rgba(255, 193, 7, 0.05);
}

.downloader-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.status-chip {
  font-weight: 500;
}

.history-table th, .history-table td {
  padding: 8px 16px !important;
}

.active-task-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease;
}

.active-task-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.task-downloading {
  background-color: rgba(255, 193, 7, 0.1);
}

.torrent-name {
  font-weight: 500;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-text {
  min-width: 45px;
  text-align: right;
}

.tasks-container {
  max-height: 300px;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0.02);
}

.task-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.task-item:last-child {
  border-bottom: none;
}

.info-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.7);
  margin-right: 4px;
}

.progress-value {
  min-width: 40px;
  text-align: right;
}
</style> 