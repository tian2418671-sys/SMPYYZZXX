// SPM扩展安装诊断脚本
// 用于检测扩展是否正确安装和加载

console.log('🔍 开始SPM扩展诊断...');

// 1. 检查文件是否存在
const extensionPath = 'extensions/spm-status-monito/';
const requiredFiles = ['manifest.json', 'index.js', 'style.css'];

console.log('📁 检查必需文件:');
requiredFiles.forEach(file => {
  fetch(`${extensionPath}${file}`)
    .then(response => {
      if (response.ok) {
        console.log(`✅ ${file} - 存在`);
      } else {
        console.log(`❌ ${file} - 缺失`);
      }
    })
    .catch(error => {
      console.log(`❌ ${file} - 加载失败:`, error.message);
    });
});

// 2. 检查扩展是否已加载
setTimeout(() => {
  console.log('🔌 检查扩展状态:');

  if (window.spmStatusMonitor) {
    console.log('✅ SPM扩展已加载');

    if (window.spmDebug) {
      console.log('📊 扩展信息:', {
        版本: window.spmDebug.version,
        状态: window.spmDebug.isActive() ? '活跃' : '非活跃',
        设置: window.spmDebug.getSettings(),
      });
    }
  } else {
    console.log('❌ SPM扩展未加载');
  }

  // 3. 检查UI元素
  const panel = document.getElementById('spm-status-panel');
  if (panel) {
    console.log('✅ SPM面板已创建');
  } else {
    console.log('❌ SPM面板未创建');
  }

  // 4. 测试斜杠命令
  if (typeof window.SlashCommandParser !== 'undefined') {
    try {
      const result = window.SlashCommandParser.executeSlashCommand('/smp');
      console.log('✅ 斜杠命令测试成功:', result);
    } catch (error) {
      console.log('❌ 斜杠命令测试失败:', error.message);
    }
  }

  console.log('🏁 诊断完成!');
}, 2000);

// 显示安装指南
console.log(`
📋 如果扩展无反应，请按以下步骤操作:

1. 确保SillyTavern已完全加载
2. 检查浏览器控制台是否有错误信息
3. 尝试刷新页面 (F5)
4. 确认扩展文件夹位置正确: ${extensionPath}
5. 在聊天中输入 /spm 命令测试

如果问题持续，请检查浏览器控制台的完整错误信息。
`);
