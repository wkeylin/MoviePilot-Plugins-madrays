from datetime import datetime, timedelta

import pytz
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from pathlib import Path
from typing import List, Tuple, Dict, Any, Optional

from app.utils.string import StringUtils
from app.helper.plugin import PluginHelper
from app.core.config import settings
from app.core.plugin import PluginManager
from app.db.systemconfig_oper import SystemConfigOper
from app.log import logger
from app.plugins import _PluginBase
from app.schemas.types import SystemConfigKey
from app.schemas import NotificationType


class LogsClean(_PluginBase):
    # 插件名称
    plugin_name = "插件日志清理重制版"
    # 插件描述
    plugin_desc = "定时清理插件产生的日志"
    # 插件图标
    plugin_icon = "https://raw.githubusercontent.com/madrays/MoviePilot-Plugins/main/icons/clean.png"
    # 插件版本
    plugin_version = "1.0"
    # 插件作者
    plugin_author = "madrays"
    # 作者主页
    author_url = "https://github.com/madrays"
    # 插件配置项ID前缀
    plugin_config_prefix = "logsclean_"
    # 加载顺序
    plugin_order = 50
    # 可使用的用户级别
    auth_level = 1

    _enable = False
    _onlyonce = False
    _cron = '30 3 * * *'
    _selected_ids: List[str] = []
    _rows = 300
    _notify = False

    # 定时器
    _scheduler: Optional[BackgroundScheduler] = None

    def init_plugin(self, config: dict = None):
        # 停止现有任务
        self.stop_service()

        if config:
            self._enable = config.get('enable', False)
            self._selected_ids = config.get('selected_ids', [])
            self._rows = int(config.get('rows', 300))
            self._onlyonce = config.get('onlyonce', False)
            self._cron = config.get('cron', '30 3 * * *')
            self._notify = config.get('notify', False)

        # 定时服务
        self._scheduler = BackgroundScheduler(timezone=settings.TZ)

        if self._onlyonce:
            self._onlyonce = False
            self.update_config({
                "onlyonce": self._onlyonce,
                "rows": self._rows,
                "enable": self._enable,
                "selected_ids": self._selected_ids,
                "cron": self._cron,
                "notify": self._notify
            })
            self._scheduler.add_job(func=self._task, trigger='date',
                                    run_date=datetime.now(tz=pytz.timezone(settings.TZ)) + timedelta(seconds=2),
                                    name="插件日志清理重制版")
        if self._enable and self._cron:
            try:
                self._scheduler.add_job(func=self._task,
                                        trigger=CronTrigger.from_crontab(self._cron),
                                        name="插件日志清理重制版")
            except Exception as err:
                logger.error(f"插件日志清理, 定时任务配置错误：{str(err)}")

        # 启动任务
        if self._scheduler.get_jobs():
            self._scheduler.print_jobs()
            self._scheduler.start()

    def _task(self):
        logger.info("开始执行插件日志清理任务...")
        
        # 获取要清理的插件列表
        clean_plugin_ids = self._selected_ids[:]
        if not clean_plugin_ids:
            # 如果未选择，则获取所有已安装插件的ID
            try:
                plugin_manager = PluginManager()
                local_plugin_instances = plugin_manager.get_local_plugins() or []
                installed_plugins = [p for p in local_plugin_instances if getattr(p, 'installed', False)]
                clean_plugin_ids = [getattr(p, 'id', None) for p in installed_plugins if getattr(p, 'id', None)]
                logger.info(f"未指定插件，将清理所有 {len(clean_plugin_ids)} 个已安装插件的日志")
            except Exception as e:
                logger.error(f"获取已安装插件列表失败: {e}")
                return # 获取列表失败则不执行

        # 记录本次运行结果
        run_results = []
        total_cleaned_lines_this_run = 0
        processed_files = 0

        for plugin_id in clean_plugin_ids:
            log_path = settings.LOG_PATH / Path("plugins") / f"{plugin_id.lower()}.log"
            if not log_path.exists():
                logger.debug(f"{plugin_id} 日志文件不存在，跳过")
                continue

            try:
                # --- 修复解码错误：添加 errors='ignore' ---
                with open(log_path, 'r', encoding='utf-8', errors='ignore') as file:
                    lines = file.readlines()
                # --- 修复结束 ---
                
                original_lines = len(lines)
                rows_to_keep = int(self._rows) # 确保是整数

                if rows_to_keep < 0: # 处理负数或无效输入
                    rows_to_keep = 0 

                if rows_to_keep == 0:
                    top_lines = []
                else:
                    top_lines = lines[-min(rows_to_keep, original_lines):]
                
                kept_lines = len(top_lines)
                cleaned_lines = original_lines - kept_lines

                # 只有当实际清理了行数时才写入文件并记录
                if cleaned_lines > 0:
                    with open(log_path, 'w', encoding='utf-8') as file:
                        file.writelines(top_lines)
                    logger.info(f"已清理 {plugin_id}: 保留 {kept_lines}/{original_lines} 行，清理 {cleaned_lines} 行")
                    total_cleaned_lines_this_run += cleaned_lines
                    run_results.append({
                        'plugin_id': plugin_id,
                        'original_lines': original_lines,
                        'kept_lines': kept_lines,
                        'cleaned_lines': cleaned_lines
                    })
                    processed_files += 1
                else:
                    logger.debug(f"{plugin_id} 日志行数 ({original_lines}) 未超过保留行数 ({rows_to_keep})，无需清理")
            except Exception as e:
                 logger.error(f"处理 {plugin_id} 日志文件 {log_path} 时出错: {e}", exc_info=True)

        # 保存本次运行的详细结果
        self.save_data('last_run_results', run_results)
        logger.info(f"本次任务共处理 {processed_files} 个插件日志，清理 {total_cleaned_lines_this_run} 行")

        # 更新清理历史记录
        if total_cleaned_lines_this_run > 0 or processed_files > 0:
            try:
                history = self.get_data('cleaning_history') or []
                history.insert(0, {
                    'timestamp': datetime.now(tz=pytz.timezone(settings.TZ)).strftime('%Y-%m-%d %H:%M:%S'),
                    'total_plugins_processed': processed_files,
                    'total_lines_cleaned': total_cleaned_lines_this_run,
                })
                # --- 修改历史记录限制 --- 
                max_history = 10 # 保留最近10次
                history = history[:max_history]
                self.save_data('cleaning_history', history)
                logger.info(f"清理历史记录已更新，当前共 {len(history)} 条记录")
            except Exception as e:
                logger.error(f"更新清理历史记录失败: {e}", exc_info=True)

        # --- 再次修改通知逻辑 ---
        if self._notify and (total_cleaned_lines_this_run > 0 or processed_files > 0):
            try:
                title = "✅ 插件日志清理完成"
                # 使用标准换行符 \n 并添加 Emoji
                text = (
                    f"🧹 清理任务已完成！\n"
                    f"--------------------\n"
                    f"⏱️ 时间: {datetime.now(tz=pytz.timezone(settings.TZ)).strftime('%Y-%m-%d %H:%M:%S')}\n"
                    f"📁 处理插件: {processed_files} 个\n"
                    f"🗑️ 清理行数: {total_cleaned_lines_this_run} 行\n"
                    f"--------------------"
                )
                self.post_message(
                    mtype=NotificationType.SiteMessage,
                    title=title,
                    text=text
                )
                logger.info("已发送清理完成通知")
            except Exception as e:
                logger.error(f"发送清理通知失败: {e}", exc_info=True)
        # --- 通知逻辑结束 ---

        logger.info("插件日志清理任务执行完毕")

    def get_form(self) -> Tuple[List[dict], Dict[str, Any]]:
        plugin_options = self.get_local_plugins()

        return [
            # 卡片1：基本设置 (启用、通知、立即运行)
            {
                'component': 'VCard',
                'props': {'class': 'mb-4', 'variant': 'outlined'},
                'content': [
                    {'component': 'VCardTitle', 'props': {'class':'text-h6 d-flex align-center'}, 'content': [
                         {'component': 'VIcon', 'props': {'icon': 'mdi-cog-outline', 'start': True, 'color':'primary', 'size': 'large'}},
                         {'component': 'span', 'text': '基本设置'}
                    ]},
                    {'component': 'VCardText', 'content': [
                        {
                            'component': 'VRow',
                            'content': [
                                {
                                    'component': 'VCol', 'props': {'cols': 12, 'sm': 4},
                                    'content': [{'component': 'VSwitch', 'props': {'model': 'enable', 'label': '启用插件', 'color':'primary'}}]
                                },
                                {
                                    'component': 'VCol', 'props': {'cols': 12, 'sm': 4},
                                    'content': [{'component': 'VSwitch', 'props': {'model': 'notify', 'label': '开启通知', 'color':'primary'}}]
                                },
                                {
                                    'component': 'VCol', 'props': {'cols': 12, 'sm': 4},
                                    'content': [{'component': 'VSwitch', 'props': {'model': 'onlyonce', 'label': '立即运行一次', 'color':'primary'}}]
                                }
                            ]
                        }
                    ]}
                ]
            },
            # 卡片2：清理规则 (周期、保留行数、选择插件)
            {
                'component': 'VCard',
                'props': {'class': 'mb-4', 'variant': 'outlined'},
                'content': [
                     {'component': 'VCardTitle', 'props': {'class':'text-h6 d-flex align-center mb-2'}, 'content': [
                         {'component': 'VIcon', 'props': {'icon': 'mdi-filter-cog-outline', 'start': True, 'color':'warning', 'size': 'large'}},
                         {'component': 'span', 'text': '清理规则'}
                     ]},
                     {'component': 'VCardText', 'content': [
                        { # 定时周期
                            'component': 'VRow',
                            'content': [{
                                'component': 'VCol', 'props': {'cols': 12},
                                'content': [{'component': 'VCronField', 'props': {'model': 'cron', 'label': '定时清理周期'}}]
                            }]
                        },
                        { # 保留行数 和 选择插件
                            'component': 'VRow',
                            'content': [
                                {
                                    'component': 'VCol', 'props': {'cols': 12, 'md': 6},
                                    'content': [{'component': 'VTextField', 'props': {'model': 'rows', 'label': '保留最近行数', 'type': 'number', 'placeholder': '300'}}]
                                },
                                {
                                    'component': 'VCol', 'props': {'cols': 12, 'md': 6},
                                    'content': [{'component': 'VSelect', 'props': {'multiple': True, 'chips': True, 'model': 'selected_ids', 'label': '指定清理插件 (留空则清理所有)', 'items': plugin_options}}]
                                }
                            ]
                        }
                    ]}
                ]
            },
            # 卡片3：提示信息
            {
                'component': 'VCard',
                'props': {'variant': 'tonal', 'color': 'info'},
                'content': [
                     {'component': 'VCardText', 'props': {'class': 'd-flex align-center'}, 'content': [
                         {'component': 'VIcon', 'props': {'icon': 'mdi-information-outline', 'start': True, 'size': 'default'}},
                         {'component': 'span', 'text': '说明：此插件用于定时清理各个插件生成的日志文件（位于 logs/plugins/ 目录下），防止日志文件过大。可设置保留最新的 N 行日志，并选择要清理的插件（不选则清理所有已安装插件）。(基于 honue 原版插件修改)'}
                     ]}
                ]
            }
        ], {
            "enable": self._enable,
            "onlyonce": self._onlyonce,
            "rows": self._rows,
            "cron": self._cron,
            "selected_ids": self._selected_ids,
            "notify": self._notify
        }

    @staticmethod
    def get_local_plugins():
        """
        获取本地插件
        (修改自 PluginReOrder 插件，确保只列出已安装插件)
        """
        plugin_manager = PluginManager()
        # 获取本地所有插件实例
        local_plugin_instances = plugin_manager.get_local_plugins() or []

        # 过滤出已安装的插件
        installed_plugins = [p for p in local_plugin_instances if getattr(p, 'installed', False)]

        # 根据插件顺序排序 (可选，但保持与 PluginReOrder 一致)
        sorted_plugins = sorted(installed_plugins, key=lambda p: getattr(p, 'plugin_order', 1000))

        # 构建 VSelect 需要的选项列表
        plugin_options = []
        for plugin in sorted_plugins:
             # 确保 getattr 有默认值以防万一
             plugin_name = getattr(plugin, 'plugin_name', getattr(plugin, 'id', '未知插件'))
             plugin_version = getattr(plugin, 'plugin_version', 'N/A')
             plugin_id = getattr(plugin, 'id', None)
             if plugin_id:
                 plugin_options.append({
                     "title": f"{plugin_name} v{plugin_version}",
                     "value": plugin_id
                 })

        return plugin_options

    def get_state(self) -> bool:
        return self._enable

    @staticmethod
    def get_command() -> List[Dict[str, Any]]:
        pass

    def get_api(self) -> List[Dict[str, Any]]:
        pass

    def get_page(self) -> List[dict]:
        """
        构建插件详情页面，展示清理结果和历史
        """
        # --- 新增：获取插件ID到名称的映射 ---
        plugin_id_to_name_map = {}
        try:
            plugin_manager = PluginManager()
            local_plugin_instances = plugin_manager.get_local_plugins() or []
            installed_plugins = [p for p in local_plugin_instances if getattr(p, 'installed', False)]
            for plugin in installed_plugins:
                plugin_id = getattr(plugin, 'id', None)
                plugin_name = getattr(plugin, 'plugin_name', plugin_id) # 获取中文名，如果失败则用ID
                if plugin_id:
                    plugin_id_to_name_map[plugin_id] = plugin_name
        except Exception as e:
            logger.error(f"获取插件名称映射失败: {e}")
        # --- 映射结束 ---

        # 1. 获取上次运行结果
        last_run_results = self.get_data('last_run_results') or []
        last_run_table_rows = []
        if not last_run_results:
            last_run_content = [{'component': 'VAlert', 'props': {'type': 'info', 'variant': 'tonal', 'text': '暂无上次运行结果，请运行一次清理任务。'}}]
        else:
            for result in last_run_results:
                plugin_id = result.get('plugin_id', 'N/A')
                # 使用映射获取插件名称，如果找不到则显示 ID
                display_name = plugin_id_to_name_map.get(plugin_id, plugin_id)
                last_run_table_rows.append({
                    'component': 'tr',
                    'content': [
                        {'component': 'td', 'text': display_name},
                        {'component': 'td', 'text': str(result.get('original_lines', 0))},
                        {'component': 'td', 'text': str(result.get('kept_lines', 0))},
                        {'component': 'td', 'text': str(result.get('cleaned_lines', 0))}
                    ]
                })
            last_run_content = [{'component': 'VTable', 'props': {'hover': True, 'density': 'compact'}, 'content': [
                {'component': 'thead', 'content': [{'component': 'tr', 'content': [
                    {'component': 'th', 'text': '插件名称'},
                    {'component': 'th', 'text': '原始行数'},
                    {'component': 'th', 'text': '保留行数'},
                    {'component': 'th', 'text': '清理行数'}
                ]}]},
                {'component': 'tbody', 'content': last_run_table_rows}
            ]}]

        # 2. 获取清理历史
        history = self.get_data('cleaning_history') or []
        history_table_rows = []
        if not history:
             history_content = [{'component': 'VAlert', 'props': {'type': 'info', 'variant': 'tonal', 'text': '暂无清理历史记录。'}}]
        else:
            for record in history:
                 history_table_rows.append({
                    'component': 'tr',
                    'content': [
                        {'component': 'td', 'props': {'class': 'text-caption'}, 'text': record.get('timestamp', 'N/A')},
                        {'component': 'td', 'text': str(record.get('total_plugins_processed', 0))},
                        {'component': 'td', 'text': str(record.get('total_lines_cleaned', 0))}
                    ]
                })
            history_content = [{'component': 'VTable', 'props': {'hover': True, 'density': 'compact'}, 'content': [
                {'component': 'thead', 'content': [{'component': 'tr', 'content': [
                    {'component': 'th', 'text': '时间'},
                    {'component': 'th', 'text': '处理插件数'},
                    {'component': 'th', 'text': '清理总行数'}
                ]}]},
                {'component': 'tbody', 'content': history_table_rows}
            ]}]

        # 3. 组装页面
        return [
            {
                'component': 'VCard', 'props': {'variant': 'outlined', 'class': 'mb-4'},
                'content': [
                    {'component': 'VCardTitle', 'props': {'class': 'text-h6 d-flex align-center'}, 'content': [
                        {'component': 'VIcon', 'props':{'icon':'mdi-clipboard-text-clock-outline', 'start': True, 'color': 'blue-grey'}},
                        {'component': 'span', 'text': '📊 上次运行结果'}
                    ]},
                    {'component': 'VCardText', 'content': last_run_content}
                ]
            },
            {
                'component': 'VCard', 'props': {'variant': 'outlined'},
                'content': [
                     {'component': 'VCardTitle', 'props': {'class': 'text-h6 d-flex align-center'}, 'content': [
                        {'component': 'VIcon', 'props':{'icon':'mdi-history', 'start': True, 'color': 'deep-purple-accent-1'}},
                        {'component': 'span', 'text': '📜 清理历史记录'}
                     ]},
                    {'component': 'VCardText', 'content': history_content}
                ]
            }
        ]

    def stop_service(self):
        pass
