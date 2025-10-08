// SPM Status Monitor Extension for SillyTavern
// Version: 8.7.0

import { eventSource, event_types } from '../../../../script.js';
import { getContext } from '../../extensions.js';
import { registerSlashCommand } from '../../slash-commands.js';

// 扩展配置
const EXTENSION_NAME = 'SPMStatusMonitor';
const EXTENSION_VERSION = '8.7.0';

// 全局状态
let extensionSettings = {};
let isExtensionActive = false;

// 默认设置
const defaultSettings = {
  enableRealTimeMonitoring: true,
  autoUpdateInterval: 5000,
  enableNotifications: true,
  themeMode: 'auto',
};

// 日志函数
const log = (...args) => console.log('[SPM Status Monitor]', ...args);

// 检查是否已加载
if (window.spmStatusMonitor) {
  log('扩展已加载，跳过重复初始化');
} else {
  window.spmStatusMonitor = true;
  initExtension();
}

/**
 * 扩展初始化
 */
async function initExtension() {
  try {
    log('🚀 SPM Status Monitor v8.7.0 初始化中...');

    loadSettings();
    setupEventListeners();
    registerSlashCommands();
    createUI();

    log('✅ SPM Status Monitor 初始化完成');
    isExtensionActive = true;
  } catch (error) {
    console.error('❌ SPM Status Monitor 初始化失败:', error);
  }
}

/**
 * 加载设置
 */
function loadSettings() {
  const context = getContext();
  extensionSettings = context.extensionSettings[EXTENSION_NAME] || {};
  extensionSettings = { ...defaultSettings, ...extensionSettings };
  context.extensionSettings[EXTENSION_NAME] = extensionSettings;
  context.saveSettingsDebounced();
  log('设置已加载');
}

/**
 * 设置事件监听
 */
function setupEventListeners() {
  eventSource.on(event_types.MESSAGE_SENT, handleMessageSent);
  eventSource.on(event_types.MESSAGE_RECEIVED, handleMessageReceived);
  log('事件监听器已设置');
}

/**
 * 注册斜杠命令
 */
function registerSlashCommands() {
  registerSlashCommand('spm', spmCommand, [], '– 显示SPM状态监控面板', true, true);
  log('斜杠命令已注册');
}

/**
 * 创建UI
 */
function createUI() {
  if (document.getElementById('spm-status-panel')) {
    log('UI面板已存在');
    return;
  }

  const panel = document.createElement('div');
  panel.id = 'spm-status-panel';
  panel.className = 'spm-panel';
  panel.innerHTML = `
        <div class="spm-header">
            <h3>SPM Status Monitor v${EXTENSION_VERSION}</h3>
            <button id="spm-close" class="spm-btn">×</button>
        </div>
        <div class="spm-content">
            <div class="status-item">
                <span>状态: <span id="spm-status">活跃</span></span>
            </div>
            <div class="status-item">
                <span>版本: ${EXTENSION_VERSION}</span>
            </div>
        </div>
    `;

  document.body.appendChild(panel);

  // 绑定关闭事件
  const closeBtn = document.getElementById('spm-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.style.display = 'none';
    });
  }

  log('UI界面已创建');
}

/**
 * 事件处理
 */
function handleMessageSent(data) {
  log('消息已发送');
}

function handleMessageReceived(data) {
  log('消息已接收');
}

/**
 * 斜杠命令处理
 */
function spmCommand() {
  const panel = document.getElementById('spm-status-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    return 'SPM面板显示状态已切换';
  }
  return 'SPM面板未找到';
}

// 调试信息
window.spmDebug = {
  version: EXTENSION_VERSION,
  isActive: () => isExtensionActive,
  getSettings: () => extensionSettings,
};

log(`SPM Status Monitor v${EXTENSION_VERSION} 脚本已加载`);
