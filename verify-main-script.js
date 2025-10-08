// SPM扩展主脚本验证工具
// 验证st-extension.js是否正确加载和初始化

console.log('🔍 SPM主脚本验证开始...');

// 验证函数
function verifySPMExtension() {
  const results = {
    manifestCorrect: false,
    scriptLoaded: false,
    classAvailable: false,
    instanceCreated: false,
    uiCreated: false,
    errors: [],
  };

  try {
    // 1. 检查manifest.json是否指向正确的脚本
    fetch('manifest.json')
      .then(response => response.json())
      .then(manifest => {
        results.manifestCorrect = manifest.js === 'st-extension.js';
        console.log(`📋 Manifest检查: ${results.manifestCorrect ? '✅' : '❌'} (js: ${manifest.js})`);
      })
      .catch(error => {
        results.errors.push(`Manifest读取失败: ${error.message}`);
        console.log('❌ 无法读取manifest.json');
      });

    // 2. 检查SPMStatusMonitor类是否存在
    if (typeof SPMStatusMonitor !== 'undefined') {
      results.classAvailable = true;
      console.log('✅ SPMStatusMonitor类已定义');
    } else {
      results.errors.push('SPMStatusMonitor类未定义');
      console.log('❌ SPMStatusMonitor类未定义');
    }

    // 3. 检查全局实例是否存在
    if (typeof window.SPMStatusMonitor !== 'undefined' || typeof spmMonitor !== 'undefined') {
      results.instanceCreated = true;
      console.log('✅ SPM实例已创建');

      // 检查实例详情
      const instance = window.SPMStatusMonitor || window.spmMonitor;
      if (instance) {
        console.log(`📊 SPM实例信息:`, {
          版本: typeof instance.constructor !== 'undefined' ? 'Class Instance' : 'Unknown',
          活跃状态: instance.isActive || false,
          方法数量: Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).length,
        });
      }
    } else {
      results.errors.push('SPM实例未创建');
      console.log('❌ SPM实例未创建');
    }

    // 4. 检查UI元素是否存在
    const triggerBtn = document.getElementById('spm-status-monitor-btn');
    const panel = document.getElementById('spm-panel');

    if (triggerBtn || panel) {
      results.uiCreated = true;
      console.log('✅ SPM UI元素已创建');

      if (triggerBtn) console.log('  - 触发按钮存在');
      if (panel) console.log('  - 主面板存在');
    } else {
      results.errors.push('SPM UI元素未创建');
      console.log('❌ SPM UI元素未创建');
    }

    // 5. 尝试手动触发初始化
    console.log('🔧 尝试手动初始化...');

    if (typeof spmMonitor !== 'undefined' && spmMonitor.init) {
      try {
        spmMonitor.init();
        console.log('✅ 手动初始化成功');
      } catch (error) {
        console.log('⚠️ 手动初始化失败:', error.message);
        results.errors.push(`手动初始化失败: ${error.message}`);
      }
    }
  } catch (error) {
    results.errors.push(`验证过程出错: ${error.message}`);
    console.error('🚨 验证过程出错:', error);
  }

  // 输出总结
  setTimeout(() => {
    console.log('\n📋 验证结果总结:');
    console.log(`✅ Manifest配置: ${results.manifestCorrect ? '正确' : '错误'}`);
    console.log(`✅ 脚本加载: ${results.scriptLoaded ? '成功' : '需要检查'}`);
    console.log(`✅ 类定义: ${results.classAvailable ? '成功' : '失败'}`);
    console.log(`✅ 实例创建: ${results.instanceCreated ? '成功' : '失败'}`);
    console.log(`✅ UI创建: ${results.uiCreated ? '成功' : '失败'}`);

    if (results.errors.length > 0) {
      console.log('\n❌ 发现的问题:');
      results.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    // 给出建议
    console.log('\n💡 建议操作:');
    if (!results.manifestCorrect) {
      console.log('  - 确认manifest.json中的"js"字段指向"st-extension.js"');
    }
    if (!results.classAvailable) {
      console.log('  - 检查st-extension.js是否正确加载');
      console.log('  - 查看浏览器控制台是否有JavaScript错误');
    }
    if (!results.instanceCreated) {
      console.log('  - 等待1-2秒后重试验证');
      console.log('  - 检查是否有JavaScript错误阻止实例化');
    }
    if (!results.uiCreated) {
      console.log('  - 尝试手动运行: spmMonitor.init()');
      console.log('  - 检查CSS样式是否正确加载');
    }

    console.log('\n🔧 快速修复命令:');
    console.log('  spmMonitor.init() - 手动初始化');
    console.log('  spmMonitor.createTriggerButton() - 创建触发按钮');
    console.log('  spmMonitor.createMainPanel() - 创建主面板');
  }, 2000);

  return results;
}

// 立即执行验证
const verificationResults = verifySPMExtension();

// 添加到window对象供手动调用
window.verifySPMExtension = verifySPMExtension;

console.log('🔍 验证脚本已加载，结果将在2秒后显示');
console.log('💡 可以随时运行 verifySPMExtension() 重新验证');
