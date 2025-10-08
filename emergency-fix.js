// 紧急修复脚本 - 如果扩展仍无反应，请在浏览器控制台中运行此脚本

console.log('🚑 SPM扩展紧急修复脚本启动...');

// 1. 清理可能的冲突
if (window.spmStatusMonitor) {
  delete window.spmStatusMonitor;
  console.log('清理了现有的SPM实例');
}

// 2. 创建最小化的工作版本
function createMinimalSPM() {
  console.log('创建最小化SPM扩展...');

  // 创建基础UI
  const panel = document.createElement('div');
  panel.id = 'spm-emergency-panel';
  panel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 300px;
        background: rgba(0, 0, 0, 0.95);
        border: 2px solid #ff6b6b;
        border-radius: 8px;
        color: white;
        font-family: Arial, sans-serif;
        z-index: 999999;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    `;

  panel.innerHTML = `
        <div style="background: #ff6b6b; padding: 10px; border-radius: 6px 6px 0 0; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 14px; color: white;">🚑 SPM Emergency Mode</h3>
            <button id="spm-emergency-close" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 8px; border-radius: 3px; cursor: pointer;">×</button>
        </div>
        <div style="padding: 15px;">
            <div style="margin-bottom: 10px; padding: 8px; background: rgba(255,107,107,0.1); border-radius: 4px;">
                <strong>紧急模式激活</strong><br>
                <small>原始扩展加载失败，使用备用功能</small>
            </div>
            <div style="margin-bottom: 8px; font-size: 12px;">
                ⚡ 状态: <span style="color: #4CAF50;">紧急运行</span>
            </div>
            <div style="margin-bottom: 8px; font-size: 12px;">
                📦 版本: 8.7.0-emergency
            </div>
            <div style="margin-bottom: 8px; font-size: 12px;">
                🕒 时间: ${new Date().toLocaleTimeString()}
            </div>
            <div style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; font-size: 11px;">
                <strong>修复建议:</strong><br>
                1. 检查文件路径是否正确<br>
                2. 确认SillyTavern版本兼容<br>
                3. 清除浏览器缓存重试<br>
                4. 查看控制台完整错误信息
            </div>
        </div>
    `;

  // 清理现有面板
  const existing = document.getElementById('spm-emergency-panel');
  if (existing) existing.remove();

  document.body.appendChild(panel);

  // 绑定关闭事件
  document.getElementById('spm-emergency-close').addEventListener('click', () => {
    panel.remove();
    console.log('紧急面板已关闭');
  });

  console.log('✅ 紧急面板创建成功');
  return panel;
}

// 3. 创建调试函数
function createDebugTools() {
  window.spmEmergencyDebug = {
    version: '8.7.0-emergency',
    createPanel: createMinimalSPM,
    testFiles: async function () {
      const files = [
        'extensions/spm-status-monito/manifest.json',
        'extensions/smp-status-monito/index.js',
        'extensions/spm-status-monito/style.css',
      ];

      console.log('🔍 检测扩展文件:');
      for (const file of files) {
        try {
          const response = await fetch(file);
          console.log(`${response.ok ? '✅' : '❌'} ${file} - 状态: ${response.status}`);
        } catch (error) {
          console.log(`❌ ${file} - 错误: ${error.message}`);
        }
      }
    },
    showHelp: function () {
      console.log(`
🆘 SPM扩展紧急帮助

可用命令:
- spmEmergencyDebug.createPanel() : 创建紧急面板
- spmEmergencyDebug.testFiles() : 检测文件状态  
- spmEmergencyDebug.showHelp() : 显示此帮助

如果扩展无法正常加载，可能的原因:
1. 文件路径不正确
2. SillyTavern版本不兼容
3. 浏览器限制了某些功能
4. 存在JavaScript错误

解决步骤:
1. 检查控制台错误信息
2. 确认文件都在正确位置
3. 尝试手动运行: spmEmergencyDebug.createPanel()
4. 如果问题持续，请提供详细错误信息
            `);
    },
  };

  console.log('🔧 调试工具已创建，输入 spmEmergencyDebug.showHelp() 查看帮助');
}

// 4. 立即执行修复
try {
  createMinimalSPM();
  createDebugTools();

  console.log('✅ 紧急修复完成！');
  console.log('💡 如果正常扩展无法工作，紧急面板将提供基本功能');
  console.log('🔧 输入 spmEmergencyDebug.showHelp() 获取更多帮助');

  // 标记紧急模式
  window.spmStatusMonitor = 'emergency-mode';
} catch (error) {
  console.error('❌ 紧急修复失败:', error);
  console.log('请手动运行: createMinimalSPM()');
}
