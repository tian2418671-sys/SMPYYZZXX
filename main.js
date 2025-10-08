// SPM Status Monitor - SillyTavern Extension Entry Point
// 为SillyTavern平台设计的角色状态监控扩展
// Version: 8.4.0

(function () {
  'use strict';

  console.log('📊 SPM Status Monitor v8.4.0 开始加载...');

  // 检查是否在SillyTavern环境中
  function isSillyTavernEnvironment() {
    return (
      typeof window !== 'undefined' &&
      window.location &&
      // 检查URL路径
      (window.location.pathname.includes('SillyTavern') ||
        // 检查端口
        window.location.port === '8000' ||
        window.location.port === '8080' ||
        // 检查主机名
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        // 检查SillyTavern特有元素
        document.querySelector('#extensions_panel') ||
        document.querySelector('#chat') ||
        document.querySelector('#send_textarea') ||
        document.querySelector('#character_popup') ||
        // 检查全局变量
        typeof eventSource !== 'undefined' ||
        typeof characters !== 'undefined')
    );
  }

  // 加载扩展脚本
  function loadExtensionScript() {
    const script = document.createElement('script');

    // 更精确的脚本路径
    const extensionPath = document.currentScript?.src || window.location.href;
    const basePath = extensionPath.substring(0, extensionPath.lastIndexOf('/') + 1);
    script.src = basePath + 'st-extension.js';
    script.type = 'text/javascript';

    script.onload = function () {
      console.log('✅ SPM Status Monitor 扩展脚本已加载');

      // 确保扩展完全初始化
      setTimeout(() => {
        if (window.spmMonitor && window.spmMonitor.isActive) {
          console.log('🎯 SPM Status Monitor 完全激活');
        } else {
          console.warn('⚠️ SPM Status Monitor 可能未完全初始化');
        }
      }, 2000);
    };

    script.onerror = function (error) {
      console.error('❌ SPM Status Monitor 扩展脚本加载失败:', error);
      // 尝试降级方案
      loadBasicSPMMonitor();
    };

    document.head.appendChild(script);
  }

  // 降级方案：基础SPM监控功能
  function loadBasicSPMMonitor() {
    console.log('🔄 启用SPM Status Monitor 基础模式...');

    // 创建简单的工具栏按钮
    function createBasicButton() {
      // 查找合适的工具栏位置
      const toolbar =
        document.querySelector('#top-bar, #send_form, .menu_button') ||
        document.querySelector('[data-i18n="Settings"]')?.parentElement;

      if (toolbar) {
        const button = document.createElement('div');
        button.id = 'spm-monitor-button';
        button.innerHTML = `
                    <div style="
                        display: inline-flex;
                        align-items: center;
                        padding: 8px 12px;
                        background: linear-gradient(45deg, #1e3c72, #2a5298);
                        border: none;
                        border-radius: 6px;
                        color: white;
                        cursor: pointer;
                        margin: 5px;
                        font-size: 14px;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        📊 <span style="margin-left: 5px;">SPM Monitor</span>
                    </div>
                `;

        button.addEventListener('click', function () {
          // 尝试重新加载完整扩展
          if (isSillyTavernEnvironment()) {
            loadExtensionScript();
            setTimeout(() => {
              if (window.spmMonitor && window.spmMonitor.isActive) {
                alert('🎉 SPM Status Monitor 已成功激活！\n\n请查看页面右下角的SPM图标。');
              } else {
                alert(
                  '⚠️ SPM Status Monitor 基础模式\n\n当前运行在基础模式下。\n\n可能原因：\n• 扩展文件未完全加载\n• SillyTavern环境检测异常\n• 需要刷新页面重新加载\n\n建议：刷新页面或重启SillyTavern',
                );
              }
            }, 1000);
          } else {
            alert('❌ SillyTavern环境未检测到\n\n请确保：\n• 在SillyTavern中运行\n• 扩展已正确安装\n• 页面已完全加载');
          }
        });

        toolbar.appendChild(button);
        console.log('✅ SPM Monitor 基础按钮已创建');
      } else {
        console.warn('⚠️ 未找到合适的工具栏位置');
      }
    }

    // 等待DOM就绪
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createBasicButton);
    } else {
      createBasicButton();
    }
  }

  // 主启动逻辑
  function initializeExtension() {
    console.log('🚀 SPM Status Monitor 启动中...');

    if (isSillyTavernEnvironment()) {
      console.log('🎯 检测到SillyTavern环境');

      // 检查是否已经加载过扩展
      if (window.spmMonitor) {
        console.log('✅ SPM扩展已加载，尝试激活');
        if (!window.spmMonitor.isActive) {
          window.spmMonitor.init();
        }
        return;
      }

      // 等待页面准备就绪后加载扩展
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadExtensionScript);
      } else {
        // 延迟一下确保SillyTavern完全加载
        setTimeout(loadExtensionScript, 500);
      }
    } else {
      console.warn('⚠️ 未检测到SillyTavern环境，启动基础模式');
      loadBasicSPMMonitor();
    }
  }

  // 启动扩展
  initializeExtension();
})();

// 降级方案：基础SPM监控功能
function loadBasicSPMMonitor() {
  console.log('🔄 启用SPM Status Monitor 基础模式...');

  // 创建简单的工具栏按钮
  function createBasicButton() {
    // 等待DOM就绪
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createBasicButton);
      return;
    }

    // 查找工具栏
    const toolbar = document.querySelector('#top-bar, .top-bar, .toolbar, #extensions_menu');
    if (!toolbar) {
      console.warn('⚠️ 未找到合适的工具栏位置');
      return;
    }

    // 创建按钮
    const button = document.createElement('button');
    button.id = 'spm-basic-monitor-btn';
    button.className = 'menu_button';
    button.innerHTML = '📊 SPM监控';
    button.title = 'SPM Status Monitor - 角色状态监控';

    button.addEventListener('click', () => {
      showBasicPanel();
    });

    toolbar.appendChild(button);
    console.log('✅ SPM基础监控按钮已创建');
  }

  // 显示基础面板
  function showBasicPanel() {
    // 移除现有面板
    const existingPanel = document.getElementById('spm-basic-panel');
    if (existingPanel) {
      existingPanel.remove();
      return;
    }

    // 创建基础面板
    const panel = document.createElement('div');
    panel.id = 'spm-basic-panel';
    panel.style.cssText = `
            position: fixed;
            top: 20%;
            right: 2%;
            width: 400px;
            height: 300px;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            z-index: 10000;
            color: white;
            padding: 20px;
            font-family: Arial, sans-serif;
        `;

    panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0;">📊 SPM Status Monitor</h3>
                <button onclick="this.parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer;">✕</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4>🎯 基础模式</h4>
                <p style="font-size: 14px; opacity: 0.8;">SPM Status Monitor 正在基础模式下运行。</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="margin-bottom: 10px;">
                    <span style="color: #4CAF50;">✅</span> 扩展状态：已加载
                </div>
                <div style="margin-bottom: 10px;">
                    <span style="color: #4CAF50;">📊</span> 监控模式：基础功能
                </div>
                <div style="margin-bottom: 10px;">
                    <span style="color: #2196F3;">🔗</span> 平台：SillyTavern
                </div>
            </div>
            
            <div style="text-align: center;">
                <p style="font-size: 12px; opacity: 0.7;">
                    完整功能请确保扩展正确安装<br>
                    Version: 8.4.0
                </p>
            </div>
        `;

    document.body.appendChild(panel);
  }

  // 初始化基础模式
  createBasicButton();
}

// 扩展元数据（供SillyTavern识别）
window.spmStatusMonitorMeta = {
  name: 'SPM Status Monitor',
  version: '8.4.0',
  description: 'SillyTavern角色状态监控扩展',
  author: 'SPM Team',
  type: 'monitoring',
};
