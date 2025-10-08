// SPM Status Monitor - SillyTavern Extension// SPM Status Monitor - SillyTavern Extension// SPM 状态监控（数据表格版）扩展入口

// 完全符合 SillyTavern 官方扩展标准

// Version: 8.5.0// 符合 SillyTavern 官方扩展标准的状态监控扩展// 说明：该入口用于在 SillyTavern 的第三方扩展加载器中动态引入 src/main.js 或 dist/bundle.js



import { eventSource, event_types } from '../../../../script.js';// Version: 8.5.0// 优先加载开发版本（src/main.js），如果不存在则加载生产版本（dist/bundle.js）

import { getContext } from '../../extensions.js';

import { registerSlashCommand } from '../../slash-commands.js';// 这样可以确保在开发环境中使用未压缩版本，便于调试



// 扩展配置import { eventSource, event_types } from '../../../../script.js';

const EXTENSION_NAME = 'SPMStatusMonitor';

const EXTENSION_VERSION = '8.7.0';import { getContext } from '../../extensions.js';(() => {



// 全局状态import { registerSlashCommand } from '../../slash-commands.js';  const EXT_ID = 'spm-status-monitor';

let extensionSettings = {};

let isActive = false;  const EXT_NAME = 'SPM Status Monitor';

let monitoringInterval = null;

// 扩展配置

// 默认设置

const defaultSettings = {const EXTENSION_NAME = 'SPMStatusMonitor';  // 轻量日志

  enableRealTimeMonitoring: true,

  autoUpdateInterval: 5000,const EXTENSION_VERSION = '8.5.0';  const log = (...args) => console.log(`[${EXT_NAME}]`, ...args);

  enableNotifications: true,

  themeMode: 'auto',const EXTENSION_DISPLAY_NAME = 'SPM Status Monitor';

  enableFunctionCalling: true

};  // 检查是否已经加载过



// 监控数据// 全局状态管理  if (window.spmStatusMonitor) {

let monitoringData = {

  characterStats: { messageCount: 0, lastActivity: null },let extensionSettings = {};    log('扩展已加载，跳过重复初始化');

  userStats: { messageCount: 0, lastActivity: null },

  systemHealth: { status: 'normal', uptime: Date.now() },let isExtensionActive = false;    return;

  activityLog: []

};let monitoringData = {  }



/**  characterStats: {},

 * 扩展初始化

 */  chatMetrics: {},  // 加载UI重新设计集成器

async function initExtension() {

  try {  systemHealth: {},  async function loadUIRedesignIntegrator() {

    console.log('🚀 SPM Status Monitor v8.5.0 初始化中...');

      userInteraction: {}    try {

    // 加载设置

    loadSettings();};      const currentScript =

    

    // 设置事件监听        document.currentScript ||

    setupEventListeners();

    // 默认设置        (function () {

    // 注册斜杠命令

    registerSlashCommands();const defaultSettings = {          const scripts = document.getElementsByTagName('script');

    

    // 注册函数调用工具  enableRealTimeMonitoring: true,          return scripts[scripts.length - 1] || null;

    registerFunctionTools();

      showStatusPanel: true,        })();

    // 初始化UI

    initializeUI();  autoUpdateInterval: 5000,      const baseUrl = currentScript ? new URL('.', currentScript.src).href : new URL('.', location.href).href;

    

    // 启动监控  enableNotifications: true,      const integratorPath = new URL('ui-integration-script.js', baseUrl).href;

    if (extensionSettings.enableRealTimeMonitoring) {

      startMonitoring();  themeMode: 'auto', // auto, dark, light

    }

      displayMetrics: ['activity', 'response_time', 'memory', 'interaction'],      await injectScript(integratorPath);

    isActive = true;

    addLog('SPM扩展初始化完成');  enableFunctionCalling: true,      log('UI重新设计集成器加载完成');

    console.log('✅ SPM Status Monitor 初始化成功');

      logLevel: 'info' // debug, info, warn, error

  } catch (error) {

    console.error('❌ SPM初始化失败:', error);};      // 触发UI重新设计集成

  }

}      if (window.integrateRedesignedUI) {



/**/**        window.integrateRedesignedUI();

 * 加载设置

 */ * 扩展初始化函数      }

function loadSettings() {

  const context = getContext(); */    } catch (e) {

  const saved = context.extensionSettings[EXTENSION_NAME] || {};

  extensionSettings = { ...defaultSettings, ...saved };async function initExtension() {      log('UI重新设计集成器加载失败，使用原始UI:', e);

  console.log('📋 SPM设置已加载');

}  try {    }



/**    console.log(`🚀 ${EXTENSION_DISPLAY_NAME} v${EXTENSION_VERSION} 初始化中...`);  }

 * 保存设置

 */    

function saveSettings() {

  const context = getContext();    // 加载设置  // 动态注入扩展内置打包脚本

  context.extensionSettings[EXTENSION_NAME] = extensionSettings;

  context.saveSettingsDebounced();    loadExtensionSettings();  async function loadMainScript() {

  console.log('💾 SPM设置已保存');

}        try {



/**    // 设置事件监听器      // 计算基准路径：严格以当前脚本 index.js 的 src 为基准

 * 设置事件监听器

 */    setupEventListeners();      const currentScript =

function setupEventListeners() {

  eventSource.on(event_types.MESSAGE_RECEIVED, (data) => {            document.currentScript ||

    monitoringData.characterStats.messageCount++;

    monitoringData.characterStats.lastActivity = Date.now();    // 注册斜杠命令        (function () {

    addLog(`收到角色消息`);

    updateUI();    registerSlashCommands();          const scripts = document.getElementsByTagName('script');

  });

                return scripts[scripts.length - 1] || null;

  eventSource.on(event_types.MESSAGE_SENT, (data) => {

    monitoringData.userStats.messageCount++;    // 注册函数调用工具（如果支持）        })();

    monitoringData.userStats.lastActivity = Date.now();

    addLog(`发送用户消息`);    registerFunctionTools();      const baseUrl = currentScript ? new URL('.', currentScript.src).href : new URL('.', location.href).href;

    updateUI();

  });    

  

  eventSource.on(event_types.CHAT_CHANGED, () => {    // 初始化UI      // 优先加载开发版本（未压缩），方便调试

    resetStats();

    addLog('聊天已切换');    initializeUI();      const devPath = new URL('src/main.js', baseUrl).href;

  });

            const prodPath = new URL('dist/bundle.js', baseUrl).href;

  eventSource.on(event_types.CHARACTER_SELECTED, (data) => {

    resetStats();    // 启动监控系统

    addLog(`角色已选择: ${data?.character?.name || '未知'}`);

  });    if (extensionSettings.enableRealTimeMonitoring) {      try {

  

  console.log('🔗 事件监听器已设置');      startMonitoring();        await injectScript(devPath);

}

    }        log('已加载开发版本 src/main.js');

/**

 * 注册斜杠命令          } catch (e) {

 */

function registerSlashCommands() {    isExtensionActive = true;        log('开发版本不可用，回退到生产版本 dist/bundle.js');

  registerSlashCommand('spm', handleSpmCommand, ['spm-status'], 

    'SPM状态监控命令。用法: /spm [show|hide|toggle|export|reset]');    console.log(`✅ ${EXTENSION_DISPLAY_NAME} 初始化完成`);        await injectScript(prodPath);

  

  console.log('⚡ 斜杠命令已注册');          }

}

    // 触发初始化完成事件      return true;

/**

 * 注册函数调用工具    eventSource.emit('spm_extension_loaded', { version: EXTENSION_VERSION });    } catch (e) {

 */

function registerFunctionTools() {          console.error(`[${EXT_NAME}] 主脚本加载失败:`, e);

  const context = getContext();

    } catch (error) {      return false;

  if (!context.isToolCallingSupported || !context.isToolCallingSupported()) {

    console.log('ℹ️ 当前API不支持函数调用');    console.error(`❌ ${EXTENSION_DISPLAY_NAME} 初始化失败:`, error);    }

    return;

  }    showNotification('扩展初始化失败', 'error');  }

  

  // 角色状态查询工具  }

  context.registerFunctionTool({

    name: 'spm_get_status',}  function injectScript(src) {

    displayName: 'SPM状态查询',

    description: '获取当前聊天的状态信息，包括消息统计、活跃度等。当需要了解聊天状态或互动情况时使用。',    return new Promise((resolve, reject) => {

    parameters: {

      type: 'object',/**      // 防止重复加载

      properties: {

        type: { * 加载扩展设置      const existing = document.querySelector(`script[src="${src}"]`);

          type: 'string',

          description: '查询类型', */      if (existing) {

          enum: ['summary', 'character', 'user', 'system']

        }function loadExtensionSettings() {        resolve(true);

      },

      required: ['type']  const context = getContext();        return;

    },

    action: async ({ type }) => {  const savedSettings = context.extensionSettings[EXTENSION_NAME] || {};      }

      return getStatusInfo(type);

    },  

    formatMessage: ({ type }) => `正在查询${type}状态...`

  });  // 合并默认设置和保存的设置      const s = document.createElement('script');

  

  console.log('🛠️ 函数调用工具已注册');  extensionSettings = { ...defaultSettings, ...savedSettings };      s.src = src;

}

        s.onload = () => resolve(true);

/**

 * 初始化UI  console.log('📋 SPM设置已加载:', extensionSettings);      s.onerror = err => reject(err);

 */

function initializeUI() {}      document.head.appendChild(s);

  createStatusPanel();

  createTriggerButton();    });

  console.log('🎨 UI已初始化');

}/**  }



/** * 保存扩展设置

 * 创建状态面板

 */ */  // 等待DOM就绪的增强函数

function createStatusPanel() {

  const panelHTML = `function saveExtensionSettings() {  function waitForDOMReady() {

    <div id="spm-panel" class="spm-panel" style="display: none;">

      <div class="spm-header">  const context = getContext();    return new Promise(resolve => {

        <h3>📊 SPM Status Monitor v${EXTENSION_VERSION}</h3>

        <button id="spm-close" class="spm-btn">✕</button>  context.extensionSettings[EXTENSION_NAME] = extensionSettings;      if (document.readyState === 'loading') {

      </div>

      <div class="spm-content">  context.saveSettingsDebounced();        document.addEventListener('DOMContentLoaded', resolve, { once: true });

        <div class="spm-stats">

          <div class="spm-stat-card">        } else {

            <div class="stat-value" id="character-messages">0</div>

            <div class="stat-label">角色消息</div>  console.log('💾 SPM设置已保存');        resolve();

          </div>

          <div class="spm-stat-card">}      }

            <div class="stat-value" id="user-messages">0</div>

            <div class="stat-label">用户消息</div>    });

          </div>

          <div class="spm-stat-card">/**  }

            <div class="stat-value" id="system-status">正常</div>

            <div class="stat-label">系统状态</div> * 设置事件监听器

          </div>

        </div> */  // 注册扩展：优先使用 SillyTavern.registerExtension，否则直接加载

        <div class="spm-log" id="spm-log">

          <!-- 活动日志 -->function setupEventListeners() {  function register() {

        </div>

      </div>  // 监听聊天相关事件    const st = window?.SillyTavern;

    </div>

  `;  eventSource.on(event_types.CHAT_CHANGED, handleChatChanged);    if (st && typeof st.registerExtension === 'function') {

  

  document.body.insertAdjacentHTML('beforeend', panelHTML);  eventSource.on(event_types.MESSAGE_RECEIVED, handleMessageReceived);      st.registerExtension({

  

  // 绑定事件  eventSource.on(event_types.MESSAGE_SENT, handleMessageSent);        name: EXT_NAME,

  document.getElementById('spm-close').addEventListener('click', hidePanel);

}  eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, handleCharacterMessage);        async init() {



/**  eventSource.on(event_types.USER_MESSAGE_RENDERED, handleUserMessage);          log('init');

 * 创建触发按钮

 */            await waitForDOMReady();

function createTriggerButton() {

  const button = document.createElement('div');  // 监听角色相关事件          const ok = await loadMainScript();

  button.id = 'spm-trigger';

  button.className = 'menu_button';  eventSource.on(event_types.CHARACTER_SELECTED, handleCharacterSelected);          if (!ok) throw new Error('主脚本加载失败');

  button.innerHTML = '<i class="fa-solid fa-chart-line"></i><span>SPM</span>';

  button.title = 'SPM Status Monitor';  eventSource.on(event_types.CHARACTER_FIRST_MESSAGE, handleCharacterFirstMessage);

  button.addEventListener('click', togglePanel);

              // 等待一小段时间让脚本初始化完成

  // 添加到工具栏

  const toolbar = document.querySelector('#top-settingsBtn')?.parentElement;  // 监听系统事件          await new Promise(resolve => setTimeout(resolve, 100));

  if (toolbar) {

    toolbar.appendChild(button);  eventSource.on(event_types.SETTINGS_LOADED, handleSettingsLoaded);

    console.log('🔘 触发按钮已添加');

  } else {  eventSource.on(event_types.WORLD_INFO_ACTIVATED, handleWorldInfoActivated);          // 加载UI重新设计集成器

    // 创建悬浮按钮

    button.style.cssText = `            await loadUIRedesignIntegrator();

      position: fixed; top: 20px; right: 20px; z-index: 9999;

      background: #667eea; color: white; padding: 10px 15px;  console.log('🔗 SPM事件监听器已设置');

      border-radius: 20px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2);

    `;}          log('ready');

    document.body.appendChild(button);

    console.log('🎈 悬浮按钮已创建');        },

  }

}/**        async settings() {



/** * 注册斜杠命令          // 暂不接管设置，沿用内置面板

 * 斜杠命令处理

 */ */          return `<div class="note">SPM Status Monitor 的设置位于面板内部。</div>`;

function handleSpmCommand(args) {

  const action = args.trim().toLowerCase() || 'toggle';function registerSlashCommands() {        },

  

  switch (action) {  // /spm-status - 显示状态面板        async unload() {

    case 'show':

      showPanel();  registerSlashCommand('spm-status', handleStatusCommand, ['spm'],           log('unload');

      return '';

    case 'hide':    '显示SPM状态监控面板。用法: /spm-status [show|hide|toggle]');          try {

      hidePanel();

      return '';              window.spmStatusMonitor?.destroy?.();

    case 'toggle':

      togglePanel();  // /spm-export - 导出数据          } catch {}

      return '';

    case 'export':  registerSlashCommand('spm-export', handleExportCommand, ['spm-export'],           try {

      exportData();

      return '数据导出完成';    '导出SPM监控数据。用法: /spm-export [format] (支持: json, csv, txt)');            document.getElementById('spm-theme-styles')?.remove();

    case 'reset':

      resetStats();            } catch {}

      return '数据已重置';

    default:  // /spm-reset - 重置数据          try {

      return 'SPM命令: show, hide, toggle, export, reset';

  }  registerSlashCommand('spm-reset', handleResetCommand, ['spm-reset'],             document.getElementById('spm-launch-button')?.remove();

}

    '重置SPM监控数据。用法: /spm-reset [confirm]');          } catch {}

/**

 * 面板控制            try {

 */

function togglePanel() {  // /spm-settings - 打开设置            document.getElementById('spm-modal-backdrop')?.remove();

  const panel = document.getElementById('spm-panel');

  if (panel.style.display === 'none') {  registerSlashCommand('spm-settings', handleSettingsCommand, ['spm-config'],           } catch {}

    showPanel();

  } else {    '打开SPM设置面板。用法: /spm-settings');          delete window.spmStatusMonitor;

    hidePanel();

  }          },

}

  console.log('⚡ SPM斜杠命令已注册');      });

function showPanel() {

  const panel = document.getElementById('spm-panel');}      log('已通过 SillyTavern.registerExtension 注册');

  panel.style.display = 'flex';

  updateUI();    } else {

  addLog('状态面板已打开');

}/**      // 无扩展 API 时，直接加载主脚本



function hidePanel() { * 注册函数调用工具      (async () => {

  const panel = document.getElementById('spm-panel');

  panel.style.display = 'none'; */        await waitForDOMReady();

  addLog('状态面板已关闭');

}function registerFunctionTools() {        await loadMainScript();



/**  const context = getContext();        log('未检测到 registerExtension，已作为普通用户脚本加载');

 * 更新UI

 */        })();

function updateUI() {

  const charMsgs = document.getElementById('character-messages');  // 检查是否支持函数调用    }

  const userMsgs = document.getElementById('user-messages');

  const systemStatus = document.getElementById('system-status');  if (!context.isToolCallingSupported || !context.isToolCallingSupported()) {  }

  const logDiv = document.getElementById('spm-log');

      console.log('ℹ️ 当前API不支持函数调用，跳过工具注册');

  if (charMsgs) charMsgs.textContent = monitoringData.characterStats.messageCount;

  if (userMsgs) userMsgs.textContent = monitoringData.userStats.messageCount;    return;  // 延后注册，等待 DOM 与 SillyTavern 环境

  if (systemStatus) systemStatus.textContent = monitoringData.systemHealth.status;

    }  if (document.readyState === 'loading') {

  if (logDiv) {

    logDiv.innerHTML = monitoringData.activityLog      document.addEventListener('DOMContentLoaded', register);

      .slice(0, 20)

      .map(log => `<div class="log-entry">${log}</div>`)  if (!extensionSettings.enableFunctionCalling) {  } else {

      .join('');

  }    console.log('ℹ️ 函数调用已禁用，跳过工具注册');    register();

}

    return;  }

/**

 * 启动监控  }})();

 */

function startMonitoring() {  

  if (monitoringInterval) return;  // 注册状态查询工具

    context.registerFunctionTool({

  monitoringInterval = setInterval(() => {    name: 'spm_get_character_status',

    // 定期更新系统状态    displayName: 'SPM角色状态查询',

    monitoringData.systemHealth.uptime = Date.now() - monitoringData.systemHealth.uptime;    description: '获取当前角色的状态信息，包括活跃度、互动质量、共鸣度等指标。当用户询问角色状态、互动情况或需要分析对话质量时使用。',

    updateUI();    parameters: {

  }, extensionSettings.autoUpdateInterval);      type: 'object',

        properties: {

  addLog('监控已启动');        metric: {

}          type: 'string',

          description: '要查询的指标类型',

/**          enum: ['activity', 'interaction', 'resonance', 'all']

 * 停止监控        },

 */        timeframe: {

function stopMonitoring() {          type: 'string',

  if (monitoringInterval) {          description: '时间范围',

    clearInterval(monitoringInterval);          enum: ['current', 'session', 'today', 'week']

    monitoringInterval = null;        }

    addLog('监控已停止');      },

  }      required: ['metric']

}    },

    action: async ({ metric, timeframe = 'current' }) => {

/**      return await getCharacterStatus(metric, timeframe);

 * 工具函数    },

 */    formatMessage: ({ metric, timeframe }) => {

function addLog(message) {      return `正在查询角色${metric}状态 (${timeframe})...`;

  const timestamp = new Date().toLocaleTimeString();    }

  const logEntry = `[${timestamp}] ${message}`;  });

  monitoringData.activityLog.unshift(logEntry);  

    // 注册数据分析工具

  // 限制日志条数  context.registerFunctionTool({

  if (monitoringData.activityLog.length > 100) {    name: 'spm_analyze_conversation',

    monitoringData.activityLog = monitoringData.activityLog.slice(0, 100);    displayName: 'SPM对话分析',

  }    description: '分析当前对话的质量、情感倾向、互动深度等。当需要评估对话效果或生成对话报告时使用。',

}    parameters: {

      type: 'object',

function resetStats() {      properties: {

  monitoringData.characterStats = { messageCount: 0, lastActivity: null };        analysis_type: {

  monitoringData.userStats = { messageCount: 0, lastActivity: null };          type: 'string',

  addLog('统计数据已重置');          description: '分析类型',

  updateUI();          enum: ['quality', 'emotion', 'engagement', 'comprehensive']

}        },

        message_count: {

function exportData() {          type: 'number',

  const data = {          description: '要分析的最近消息数量',

    timestamp: new Date().toISOString(),          minimum: 1,

    version: EXTENSION_VERSION,          maximum: 50,

    data: monitoringData          default: 10

  };        }

        },

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });      required: ['analysis_type']

  const url = URL.createObjectURL(blob);    },

  const a = document.createElement('a');    action: async ({ analysis_type, message_count = 10 }) => {

  a.href = url;      return await analyzeConversation(analysis_type, message_count);

  a.download = `spm-export-${Date.now()}.json`;    },

  a.click();    formatMessage: ({ analysis_type, message_count }) => {

  URL.revokeObjectURL(url);      return `正在进行${analysis_type}分析 (最近${message_count}条消息)...`;

      }

  addLog('数据已导出');  });

}  

  console.log('🛠️ SPM函数调用工具已注册');

function getStatusInfo(type) {}

  const info = {

    timestamp: new Date().toISOString(),/**

    type: type, * 初始化用户界面

    data: {} */

  };function initializeUI() {

    // 创建主面板

  switch (type) {  createMainPanel();

    case 'summary':  

      info.data = {  // 创建触发按钮

        characterMessages: monitoringData.characterStats.messageCount,  createTriggerButton();

        userMessages: monitoringData.userStats.messageCount,  

        systemStatus: monitoringData.systemHealth.status  // 创建设置面板

      };  createSettingsPanel();

      break;  

    case 'character':  // 应用主题

      info.data = monitoringData.characterStats;  applyTheme(extensionSettings.themeMode);

      break;  

    case 'user':  console.log('🎨 SPM用户界面已初始化');

      info.data = monitoringData.userStats;}

      break;

    case 'system':/**

      info.data = monitoringData.systemHealth; * 创建主监控面板

      break; */

  }function createMainPanel() {

    const panelHTML = `

  return JSON.stringify(info, null, 2);    <div id="spm-main-panel" class="spm-panel" style="display: none;">

}      <div class="spm-header">

        <h3>📊 SPM Status Monitor v${EXTENSION_VERSION}</h3>

/**        <div class="spm-controls">

 * 设置HTML生成器          <button class="spm-btn" id="spm-refresh">🔄 刷新</button>

 */          <button class="spm-btn" id="spm-export">📤 导出</button>

function createSettingsHTML() {          <button class="spm-btn" id="spm-settings">⚙️ 设置</button>

  return `          <button class="spm-btn" id="spm-close">✕</button>

    <div class="spm-settings">        </div>

      <h4>SPM Status Monitor 设置</h4>      </div>

      <div class="setting-group">      <div class="spm-content">

        <label>        <div class="spm-sidebar">

          <input type="checkbox" id="spm-enable-monitoring" ${extensionSettings.enableRealTimeMonitoring ? 'checked' : ''}>          <nav class="spm-nav">

          启用实时监控            <button class="spm-nav-item active" data-view="dashboard">📈 仪表盘</button>

        </label>            <button class="spm-nav-item" data-view="character">👤 角色状态</button>

      </div>            <button class="spm-nav-item" data-view="chat">💬 聊天分析</button>

      <div class="setting-group">            <button class="spm-nav-item" data-view="system">⚙️ 系统监控</button>

        <label>            <button class="spm-nav-item" data-view="logs">📋 活动日志</button>

          <input type="checkbox" id="spm-enable-notifications" ${extensionSettings.enableNotifications ? 'checked' : ''}>          </nav>

          启用通知        </div>

        </label>        <div class="spm-main">

      </div>          <div id="spm-view-dashboard" class="spm-view active">

      <div class="setting-group">            <div class="spm-stats-grid" id="spm-stats-grid">

        <label for="spm-update-interval">更新间隔（毫秒）：</label>              <!-- 动态生成统计卡片 -->

        <input type="number" id="spm-update-interval" value="${extensionSettings.autoUpdateInterval}" min="1000" max="60000" step="1000">            </div>

      </div>          </div>

      <div class="setting-group">          <div id="spm-view-character" class="spm-view">

        <button id="spm-save-settings" class="menu_button" onclick="saveSettings()">保存设置</button>            <div id="spm-character-info">

      </div>              <!-- 角色信息内容 -->

    </div>            </div>

  `;          </div>

}          <div id="spm-view-chat" class="spm-view">

            <div id="spm-chat-analysis">

// 启动扩展              <!-- 聊天分析内容 -->

console.log('🎬 SPM Status Monitor 开始初始化...');            </div>

setTimeout(initExtension, 1000);          </div>
          <div id="spm-view-system" class="spm-view">
            <div id="spm-system-monitor">
              <!-- 系统监控内容 -->
            </div>
          </div>
          <div id="spm-view-logs" class="spm-view">
            <div class="monitoring-log" id="spm-activity-log">
              <!-- 活动日志 -->
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', panelHTML);
  
  // 绑定事件
  bindPanelEvents();
}

/**
 * 创建触发按钮
 */
function createTriggerButton() {
  const button = document.createElement('div');
  button.id = 'spm-trigger-btn';
  button.className = 'menu_button';
  button.innerHTML = `
    <i class="fa-solid fa-chart-line"></i>
    <span>SPM监控</span>
  `;
  button.title = `${EXTENSION_DISPLAY_NAME} v${EXTENSION_VERSION}`;
  
  button.addEventListener('click', toggleMainPanel);
  
  // 尝试添加到SillyTavern的工具栏
  const toolbar = document.querySelector('#top-settingsBtn')?.parentElement;
  if (toolbar) {
    toolbar.appendChild(button);
    console.log('🔘 SPM触发按钮已添加到工具栏');
  } else {
    // 创建悬浮按钮
    createFloatingButton(button);
  }
}

/**
 * 创建悬浮按钮
 */
function createFloatingButton(button) {
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 16px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
  });
  
  document.body.appendChild(button);
  console.log('🎈 SPM悬浮按钮已创建');
}

/**
 * 事件处理函数
 */
function handleChatChanged() {
  updateChatMetrics();
  addActivityLog('聊天已切换');
}

function handleMessageReceived(data) {
  updateCharacterStats(data);
  addActivityLog(`收到消息: ${data.mes?.substring(0, 50)}...`);
}

function handleMessageSent(data) {
  updateUserInteraction(data);
  addActivityLog(`发送消息: ${data.mes?.substring(0, 50)}...`);
}

function handleCharacterSelected(data) {
  resetCharacterStats();
  addActivityLog(`角色已选择: ${data.character?.name || '未知'}`);
}

/**
 * 斜杠命令处理函数
 */
function handleStatusCommand(args) {
  const action = args.trim().toLowerCase() || 'toggle';
  
  switch (action) {
    case 'show':
      showMainPanel();
      break;
    case 'hide':
      hideMainPanel();
      break;
    case 'toggle':
    default:
      toggleMainPanel();
      break;
  }
  
  return ''; // 不显示返回信息
}

function handleExportCommand(args) {
  const format = args.trim().toLowerCase() || 'json';
  exportData(format);
  return `数据正在以${format}格式导出...`;
}

function handleResetCommand(args) {
  if (args.trim().toLowerCase() === 'confirm') {
    resetAllData();
    return 'SPM监控数据已重置';
  } else {
    return '请使用 /spm-reset confirm 确认重置所有数据';
  }
}

function handleSettingsCommand() {
  showSettingsPanel();
  return ''; // 不显示返回信息
}

/**
 * 主面板控制函数
 */
function toggleMainPanel() {
  const panel = document.getElementById('spm-main-panel');
  if (panel.style.display === 'none') {
    showMainPanel();
  } else {
    hideMainPanel();
  }
}

function showMainPanel() {
  const panel = document.getElementById('spm-main-panel');
  panel.style.display = 'flex';
  updateDashboard();
  addActivityLog('状态面板已打开');
}

function hideMainPanel() {
  const panel = document.getElementById('spm-main-panel');
  panel.style.display = 'none';
  addActivityLog('状态面板已关闭');
}

/**
 * 工具函数
 */
function addActivityLog(message) {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;
  
  // 添加到内存日志
  if (!monitoringData.activityLog) {
    monitoringData.activityLog = [];
  }
  monitoringData.activityLog.unshift(logEntry);
  
  // 限制日志条数
  if (monitoringData.activityLog.length > 100) {
    monitoringData.activityLog = monitoringData.activityLog.slice(0, 100);
  }
  
  // 更新UI
  const logElement = document.getElementById('spm-activity-log');
  if (logElement) {
    logElement.innerHTML = monitoringData.activityLog
      .map(log => `<div class="log-entry">${log}</div>`)
      .join('');
  }
  
  // 输出到控制台（根据日志级别）
  if (extensionSettings.logLevel === 'debug') {
    console.log(`[SPM] ${message}`);
  }
}

function showNotification(message, type = 'info') {
  if (!extensionSettings.enableNotifications) return;
  
  const notification = document.createElement('div');
  notification.className = `spm-notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * 扩展注册 - 使用官方SillyTavern注册方法
 */
function registerExtension() {
  // 检查是否存在SillyTavern全局对象
  if (typeof SillyTavern !== 'undefined' && SillyTavern.registerExtension) {
    SillyTavern.registerExtension({
      name: EXTENSION_NAME,
      init: initExtension,
      settings: createSettingsHTML,
      metadata: {
        version: EXTENSION_VERSION,
        description: '角色状态监控扩展',
        author: 'tian2418671-sys'
      }
    });
    
    console.log('🔌 SPM扩展已通过官方API注册');
  } else {
    // 降级处理：直接初始化
    console.log('⚠️ 未找到SillyTavern注册API，使用降级模式');
    setTimeout(initExtension, 1000);
  }
}

/**
 * 设置HTML生成器
 */
function createSettingsHTML() {
  return `
    <div class="spm-settings">
      <h4>SPM Status Monitor 设置</h4>
      
      <div class="setting-group">
        <label>
          <input type="checkbox" id="spm-enable-monitoring" ${extensionSettings.enableRealTimeMonitoring ? 'checked' : ''}>
          启用实时监控
        </label>
      </div>
      
      <div class="setting-group">
        <label>
          <input type="checkbox" id="spm-enable-notifications" ${extensionSettings.enableNotifications ? 'checked' : ''}>
          启用通知
        </label>
      </div>
      
      <div class="setting-group">
        <label for="spm-theme-mode">主题模式：</label>
        <select id="spm-theme-mode">
          <option value="auto" ${extensionSettings.themeMode === 'auto' ? 'selected' : ''}>自动</option>
          <option value="dark" ${extensionSettings.themeMode === 'dark' ? 'selected' : ''}>深色</option>
          <option value="light" ${extensionSettings.themeMode === 'light' ? 'selected' : ''}>浅色</option>
        </select>
      </div>
      
      <div class="setting-group">
        <label for="spm-update-interval">更新间隔（毫秒）：</label>
        <input type="number" id="spm-update-interval" value="${extensionSettings.autoUpdateInterval}" min="1000" max="60000" step="1000">
      </div>
      
      <div class="setting-group">
        <button id="spm-save-settings" class="menu_button">保存设置</button>
        <button id="spm-reset-settings" class="menu_button">重置为默认</button>
      </div>
    </div>
  `;
}

// 启动扩展
console.log('🎬 SPM Status Monitor 开始注册...');
registerExtension();