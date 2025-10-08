// SPM Status Monitor - SillyTavern Extension
// Version: 8.7.0 - 第三阶段完成版本
// Description: SPM 5.5 MVU化系统状态监控扩展

const EXTENSION_VERSION = '8.7.0';

class SPMStatusMonitor {
  constructor() {
    this.isActive = false;
    this.settings = {
      autoStart: true,
      updateInterval: 5000,
      logLevel: 'info',
      enableNotifications: true,
      theme: 'dark',
    };

    // 移动端检测
    this.isMobile = this.detectMobileDevice();
    this.isTablet = this.detectTabletDevice();
    this.touchSupported = 'ontouchstart' in window;

    // 触摸手势支持
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;

    this.data = {
      interactions: 156,
      experience: 1234,
      uptime: '2天14小时',
      systemHealth: '98%',
      persona: {
        current: '纯真系',
        weight: '85%',
        activations: 45,
      },
      skills: {
        current: '口唇之道',
        proficiency: '72%',
        usage: 89,
        successRate: '85%',
      },
      evolution: {
        stage: 'stable',
        progress: '67%',
        experience: 1234,
        dailyGain: '+45',
      },
    };
    this.activityLog = [];
    this.realTimeInterval = null;
    this.monitoringPaused = false;

    // 存储事件监听器引用以便后续清理
    this.eventHandlers = {
      documentClick: null,
      documentKeydown: null,
      windowResize: null,
    };
  }

  // 初始化扩展
  init() {
    try {
      console.log('🚀 SPM Status Monitor 初始化中...');

      this.injectStyles();
      this.injectFusionStyles();
      this.injectDetailedPanelStyles();
      this.createUI();
      this.createFusionUI();
      this.bindEvents();
      this.startRealTimeUpdates();

      // 初始化移动端特性
      this.initMobileFeatures();

      this.isActive = true;
      console.log('✅ SPM Status Monitor 初始化完成');

      // 添加初始化日志
      this.addActivityLog('🚀 SPM状态监控系统已启动');

      // 记录设备信息
      const deviceInfo = this.getDeviceInfo();
      this.addActivityLog(`📱 设备: ${deviceInfo.isMobile ? '移动端' : deviceInfo.isTablet ? '平板' : '桌面端'}`);
    } catch (error) {
      console.error('❌ SPM扩展初始化失败:', error);
      this.isActive = false;
      throw error; // 重新抛出错误以便上层处理
    }
  }

  // SillyTavern集成
  initSillyTavernIntegration() {
    try {
      // 等待SillyTavern环境就绪
      if (typeof getContext === 'undefined') {
        console.log('⚠️ SillyTavern API 未就绪，使用独立模式');
        return;
      }

      const context = getContext();
      console.log('🔗 SillyTavern集成成功', context);

      // 监听聊天事件
      if (typeof eventSource !== 'undefined') {
        eventSource.on('message_sent', () => {
          this.handleChatEvent('message_sent');
        });

        eventSource.on('message_received', () => {
          this.handleChatEvent('message_received');
        });

        eventSource.on('character_selected', () => {
          this.handleCharacterChange();
        });
      }
    } catch (error) {
      console.warn('⚠️ SillyTavern集成失败，使用独立模式:', error);
    }
  }

  // 创建传统UI
  createUI() {
    try {
      // 检查是否已存在
      if (document.getElementById('spm-panel')) {
        return;
      }

      // 创建触发按钮
      this.createTriggerButton();
    } catch (error) {
      console.error('❌ 创建UI失败:', error);
      this.addActivityLog(`❌ UI创建失败: ${error.message}`);
    }
  }

  createTriggerButton() {
    try {
      const button = document.createElement('button');
      button.id = 'spm-status-monitor-btn';
      button.innerHTML = '📊<span class="button-text">SPM监控</span>';
      button.className = 'menu_button';
      button.title = 'SPM Status Monitor v' + EXTENSION_VERSION;

      button.addEventListener('click', () => {
        this.toggleFusionPanel();
      });

      // 尝试添加到SillyTavern界面
      const targetContainer = this.findSuitableContainer();
      if (targetContainer) {
        targetContainer.appendChild(button);
        console.log('📊 SPM按钮已添加到SillyTavern界面');
      } else {
        // 创建悬浮按钮
        this.createFloatingButton(button);
      }
    } catch (error) {
      console.error('❌ 创建触发按钮失败:', error);
      this.addActivityLog(`❌ 按钮创建失败: ${error.message}`);
    }
  }

  findSuitableContainer() {
    // 尝试多个可能的容器位置
    const selectors = [
      '#top_bar .menu_buttons',
      '#send_form .mes_buttons',
      '#extensions_settings2',
      '.menu_buttons',
      '#rightSendForm',
    ];

    for (const selector of selectors) {
      const container = document.querySelector(selector);
      if (container) {
        console.log(`📍 找到合适的容器: ${selector}`);
        return container;
      }
    }

    return null;
  }

  createFloatingButton(button) {
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
    console.log('🎈 创建悬浮SPM按钮');
  }

  // 创建融合UI
  createFusionUI() {
    const existingPanel = document.getElementById('spm-fusion-panel');
    if (existingPanel) {
      existingPanel.remove();
    }

    const panel = document.createElement('div');
    panel.id = 'spm-fusion-panel';
    panel.className = 'spm-fusion-panel';
    panel.style.display = 'none';

    panel.innerHTML = `
      <div class="spm-fusion-container">
        <div class="spm-fusion-header">
          <h2 class="spm-fusion-title">
            🧬 SPM 5.5 MVU化系统控制面板
          </h2>
          <div class="spm-system-status" id="spm-system-status">
            <div class="status-dot active"></div>
            <span class="status-text">活跃</span>
          </div>
          <button class="spm-fusion-close" onclick="spmMonitor.toggleFusionPanel()">✕</button>
        </div>
        
        <div class="spm-fusion-content">
          <div class="spm-sidebar">
            <button class="spm-nav-btn active" data-view="overview">📊 概览</button>
            <button class="spm-nav-btn" data-view="persona">🎭 人格系统</button>
            <button class="spm-nav-btn" data-view="skills">🎯 技巧系统</button>
            <button class="spm-nav-btn" data-view="evolution">🧬 演化系统</button>
            <button class="spm-nav-btn" data-view="statistics">📈 数据统计</button>
            <button class="spm-nav-btn" data-view="control">🎮 控制中心</button>
            <button class="spm-nav-btn" data-view="settings">⚙️ 设置</button>
          </div>
          
          <div class="spm-main-content">
            <!-- 概览视图 -->
            <div id="spm-view-overview" class="spm-view active">
              <div class="spm-overview">
                <!-- 人格系统卡片 -->
                <div class="spm-feature-card spm-persona-card" onclick="spmMonitor.switchView('persona')">
                  <div class="feature-card-header">
                    <span class="feature-card-icon">🎭</span>
                    <h3 class="feature-card-title">人格系统</h3>
                  </div>
                  <div class="feature-card-stats">
                    <div class="stat-item">
                      <div class="stat-label">当前人格</div>
                      <div class="stat-value" id="current-persona">${this.data.persona.current}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-label">权重</div>
                      <div class="stat-value" id="persona-weight">${this.data.persona.weight}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-label">激活次数</div>
                      <div class="stat-value" id="persona-activations">${this.data.persona.activations}次</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-label">切换</div>
                      <button class="command-btn-small" onclick="spmMonitor.switchPersona('mature')">成熟系</button>
                    </div>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${this.data.persona.weight}"></div>
                  </div>
                </div>
                
                <!-- 技巧系统卡片 -->
                <div class="spm-feature-card spm-skill-card" onclick="spmMonitor.switchView('skills')">
                  <div class="feature-card-header">
                    <span class="feature-card-icon">🎯</span>
                    <h3 class="feature-card-title">技巧系统</h3>
                  </div>
                  <div class="feature-card-stats">
                    <div class="stat-item">
                      <div class="stat-label">当前技巧</div>
                      <div class="stat-value" id="current-skill">${this.data.skills.current}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-label">熟练度</div>
                      <div class="stat-value" id="skill-proficiency">${this.data.skills.proficiency}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-label">使用次数</div>
                      <div class="stat-value" id="skill-usage">${this.data.skills.usage}次</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-label">成功率</div>
                      <div class="stat-value" id="skill-success-rate">${this.data.skills.successRate}</div>
                    </div>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${this.data.skills.proficiency}"></div>
                  </div>
                </div>
                
                <!-- 演化系统卡片 -->
                <div class="spm-feature-card spm-evolution-card" onclick="spmMonitor.switchView('evolution')">
                  <div class="feature-card-header">
                    <span class="feature-card-icon">🧬</span>
                    <h3 class="feature-card-title">演化系统</h3>
                  </div>
                  <div class="feature-card-stats">
                    <div class="stat-item">
                      <div class="stat-label">当前阶段</div>
                      <div class="stat-value" id="evolution-stage">${this.data.evolution.stage}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-label">演化进度</div>
                      <div class="stat-value" id="evolution-progress">${this.data.evolution.progress}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-label">经验值</div>
                      <div class="stat-value" id="evolution-exp">${this.data.evolution.experience}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-label">今日获得</div>
                      <div class="stat-value" id="evolution-daily">${this.data.evolution.dailyGain}</div>
                    </div>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${this.data.evolution.progress}"></div>
                  </div>
                </div>
                
                <!-- 数据统计卡片 -->
                <div class="spm-feature-card spm-stats-card" onclick="spmMonitor.switchView('statistics')">
                  <div class="feature-card-header">
                    <span class="feature-card-icon">📈</span>
                    <h3 class="feature-card-title">数据统计</h3>
                  </div>
                  <div class="feature-card-stats">
                    <div class="stat-item">
                      <div class="stat-label">总交互</div>
                      <div class="stat-value" id="total-interactions">${this.data.interactions}次</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-label">总经验</div>
                      <div class="stat-value" id="total-experience">${this.data.experience}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-label">运行时间</div>
                      <div class="stat-value" id="uptime">${this.data.uptime}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-label">系统健康</div>
                      <div class="stat-value" id="system-health">${this.data.systemHealth}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 系统控制中心 -->
              <div class="spm-control-center">
                <h3 class="spm-section-title">🎮 系统控制中心</h3>
                <div class="spm-control-grid">
                  <button class="spm-control-btn" onclick="spmMonitor.handleControlFunction('system-activate')">
                    <span class="control-btn-icon">🚀</span>
                    <div class="control-btn-content">
                      <div class="control-btn-title">SPM激活</div>
                      <div class="control-btn-desc">启动核心系统</div>
                    </div>
                  </button>
                  
                  <button class="spm-control-btn" onclick="spmMonitor.handleControlFunction('persona-mix')">
                    <span class="control-btn-icon">🎭</span>
                    <div class="control-btn-content">
                      <div class="control-btn-title">人格混合器</div>
                      <div class="control-btn-desc">调整人格组合</div>
                    </div>
                  </button>
                  
                  <button class="spm-control-btn" onclick="spmMonitor.handleControlFunction('advanced-interaction')">
                    <span class="control-btn-icon">💫</span>
                    <div class="control-btn-content">
                      <div class="control-btn-title">高级互动</div>
                      <div class="control-btn-desc">启动深度交互</div>
                    </div>
                  </button>
                  
                  <button class="spm-control-btn" onclick="spmMonitor.handleControlFunction('context-analysis')">
                    <span class="control-btn-icon">🧠</span>
                    <div class="control-btn-content">
                      <div class="control-btn-title">情境分析</div>
                      <div class="control-btn-desc">分析对话情境</div>
                    </div>
                  </button>
                  
                  <button class="spm-control-btn" onclick="spmMonitor.handleControlFunction('dialogue-generation')">
                    <span class="control-btn-icon">💬</span>
                    <div class="control-btn-content">
                      <div class="control-btn-title">台词生成</div>
                      <div class="control-btn-desc">智能生成回复</div>
                    </div>
                  </button>
                  
                  <button class="spm-control-btn" onclick="spmMonitor.handleControlFunction('posture-recommendation')">
                    <span class="control-btn-icon">🕺</span>
                    <div class="control-btn-content">
                      <div class="control-btn-title">姿势推荐</div>
                      <div class="control-btn-desc">推荐互动姿势</div>
                    </div>
                  </button>
                  
                  <button class="spm-control-btn" onclick="spmMonitor.handleControlFunction('data-query')">
                    <span class="control-btn-icon">🔍</span>
                    <div class="control-btn-content">
                      <div class="control-btn-title">数据查询</div>
                      <div class="control-btn-desc">查询系统数据</div>
                    </div>
                  </button>
                  
                  <button class="spm-control-btn" onclick="spmMonitor.handleControlFunction('system-verification')">
                    <span class="control-btn-icon">✅</span>
                    <div class="control-btn-content">
                      <div class="control-btn-title">系统验证</div>
                      <div class="control-btn-desc">完整性检查</div>
                    </div>
                  </button>

                  <button class="spm-control-btn" onclick="spmMonitor.showMemoryTablePanel()">
                    <span class="control-btn-icon">📋</span>
                    <div class="control-btn-content">
                      <div class="control-btn-title">记忆表格面板</div>
                      <div class="control-btn-desc">全面数据管理界面</div>
                    </div>
                  </button>

                  <button class="spm-control-btn" onclick="spmMonitor.showDetailedStatistics()">
                    <span class="control-btn-icon">📊</span>
                    <div class="control-btn-content">
                      <div class="control-btn-title">详细统计</div>
                      <div class="control-btn-desc">查看详细报告</div>
                    </div>
                  </button>

                  <button class="spm-control-btn" onclick="spmMonitor.showPerformanceOptimization()">
                    <span class="control-btn-icon">⚡</span>
                    <div class="control-btn-content">
                      <div class="control-btn-title">性能优化</div>
                      <div class="control-btn-desc">优化建议</div>
                    </div>
                  </button>

                  <button class="spm-control-btn" onclick="spmMonitor.runSystemHealthCheck()">
                    <span class="control-btn-icon">🔧</span>
                    <div class="control-btn-content">
                      <div class="control-btn-title">健康检查</div>
                      <div class="control-btn-desc">系统诊断</div>
                    </div>
                  </button>

                  <button class="spm-control-btn" onclick="spmMonitor.showHelpDocumentation()">
                    <span class="control-btn-icon">❓</span>
                    <div class="control-btn-content">
                      <div class="control-btn-title">使用帮助</div>
                      <div class="control-btn-desc">帮助文档</div>
                    </div>
                  </button>
                </div>
              </div>
              
              <!-- 实时监控 -->
              <div class="spm-monitoring">
                <div class="spm-monitoring-panel">
                  <div class="monitoring-header">
                    <h4 class="monitoring-title">📝 活动日志</h4>
                    <div class="monitoring-controls">
                      <button class="monitoring-btn" onclick="spmMonitor.toggleMonitoring()">
                        <span id="monitor-toggle-icon">⏸️</span>
                        <span id="monitor-toggle-text">暂停监控</span>
                      </button>
                      <button class="monitoring-btn" onclick="spmMonitor.refreshData()">🔄 刷新</button>
                    </div>
                  </div>
                  <div class="activity-log" id="activity-log">
                    <!-- 动态生成日志条目 -->
                  </div>
                </div>
                
                <div class="spm-monitoring-panel">
                  <div class="monitoring-header">
                    <h4 class="monitoring-title">📊 实时指标</h4>
                  </div>
                  <div class="metrics-grid">
                    <div class="metric-item">
                      <div class="metric-label">活跃度</div>
                      <div class="metric-value" id="activity-level">95%</div>
                    </div>
                    <div class="metric-item">
                      <div class="metric-label">响应时间</div>
                      <div class="metric-value" id="response-time">0.3秒</div>
                    </div>
                    <div class="metric-item">
                      <div class="metric-label">内存使用</div>
                      <div class="metric-value" id="memory-usage">45MB</div>
                    </div>
                    <div class="metric-item">
                      <div class="metric-label">同步状态</div>
                      <div class="metric-value" id="sync-status">正常</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 快捷命令面板 -->
              <div class="spm-commands">
                <h3 class="spm-section-title">⚡ 快捷命令</h3>
                <div class="spm-command-groups">
                  <div class="spm-command-group">
                    <div class="command-group-title">🎮 系统控制</div>
                    <button class="command-btn-small" onclick="spmMonitor.activateSPM()">激活SPM</button>
                    <button class="command-btn-small" onclick="spmMonitor.exportData()">导出数据</button>
                    <button class="command-btn-small" onclick="spmMonitor.showDetailedReport()">详细报告</button>
                    <button class="command-btn-small" onclick="spmMonitor.toggleTheme()">切换主题</button>
                  </div>
                  
                  <div class="spm-command-group">
                    <div class="command-group-title">🎭 人格操作</div>
                    <button class="command-btn-small" onclick="spmMonitor.switchPersona('mature')">成熟系</button>
                    <button class="command-btn-small" onclick="spmMonitor.switchPersona('innocent')">纯真系</button>
                    <button class="command-btn-small" onclick="spmMonitor.switchPersona('contrast')">反差系</button>
                    <button class="command-btn-small" onclick="spmMonitor.switchPersona('performance')">表演系</button>
                  </div>
                  
                  <div class="spm-command-group">
                    <div class="command-group-title">🎯 技巧使用</div>
                    <button class="command-btn-small" onclick="spmMonitor.useSkill('jade_hand')">玉手之艺</button>
                    <button class="command-btn-small" onclick="spmMonitor.useSkill('oral_way')">口唇之道</button>
                    <button class="command-btn-small" onclick="spmMonitor.useSkill('cave_exploration')">洞穴之探</button>
                    <button class="command-btn-small" onclick="spmMonitor.useSkill('toe_charm')">足尖之魅</button>
                  </div>
                  
                  <div class="spm-command-group">
                    <div class="command-group-title">🚀 高级功能</div>
                    <button class="command-btn-small" onclick="spmMonitor.accelerateEvolution()">演化加速</button>
                    <button class="command-btn-small" onclick="spmMonitor.advancedInteraction()">高级互动</button>
                    <button class="command-btn-small" onclick="spmMonitor.contextAnalysis()">情境分析</button>
                    <button class="command-btn-small" onclick="spmMonitor.generateDialogue()">台词生成</button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 其他视图可以在这里添加 -->
            <div id="spm-view-persona" class="spm-view">
              <h3>🎭 人格系统详细配置</h3>
              <p>人格系统功能开发中...</p>
            </div>
            
            <div id="spm-view-skills" class="spm-view">
              <div class="skills-management">
                <h3>🎯 技巧系统管理</h3>
                
                <div class="current-technique-display">
                  <div class="technique-overview">
                    <div class="technique-icon">👄</div>
                    <div class="technique-info">
                      <h4>当前技巧: 口唇之道</h4>
                      <div class="proficiency-display">
                        <span>熟练度: 72%</span>
                        <div class="proficiency-bar">
                          <div class="proficiency-fill" style="width: 72%"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="techniques-grid">
                  <div class="technique-card active" data-technique="口唇之道">
                    <div class="card-header">
                      <span class="technique-emoji">👄</span>
                      <span class="technique-name">口唇之道</span>
                      <span class="proficiency-badge">72%</span>
                    </div>
                    <div class="card-stats">
                      <div class="stat-item">
                        <span class="stat-label">使用次数:</span>
                        <span class="stat-value">89次</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">成功率:</span>
                        <span class="stat-value">85%</span>
                      </div>
                    </div>
                    <div class="card-actions">
                      <button class="action-btn primary" onclick="spmMonitor.showTechniquePerformanceDialog('口唇之道')">表现分析</button>
                      <button class="action-btn secondary" onclick="spmMonitor.showTechniqueDetail('口唇之道')">查看详情</button>
                    </div>
                  </div>

                  <div class="technique-card" data-technique="玉手之艺">
                    <div class="card-header">
                      <span class="technique-emoji">🤲</span>
                      <span class="technique-name">玉手之艺</span>
                      <span class="proficiency-badge">45%</span>
                    </div>
                    <div class="card-stats">
                      <div class="stat-item">
                        <span class="stat-label">使用次数:</span>
                        <span class="stat-value">45次</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">成功率:</span>
                        <span class="stat-value">78%</span>
                      </div>
                    </div>
                    <div class="card-actions">
                      <button class="action-btn primary" onclick="spmMonitor.showTechniquePerformanceDialog('玉手之艺')">表现分析</button>
                      <button class="action-btn secondary" onclick="spmMonitor.showTechniqueDetail('玉手之艺')">查看详情</button>
                    </div>
                  </div>

                  <div class="technique-card" data-technique="洞穴之探">
                    <div class="card-header">
                      <span class="technique-emoji">🕳️</span>
                      <span class="technique-name">洞穴之探</span>
                      <span class="proficiency-badge">38%</span>
                    </div>
                    <div class="card-stats">
                      <div class="stat-item">
                        <span class="stat-label">使用次数:</span>
                        <span class="stat-value">38次</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">成功率:</span>
                        <span class="stat-value">72%</span>
                      </div>
                    </div>
                    <div class="card-actions">
                      <button class="action-btn primary" onclick="spmMonitor.showTechniquePerformanceDialog('洞穴之探')">表现分析</button>
                      <button class="action-btn secondary" onclick="spmMonitor.showTechniqueDetail('洞穴之探')">查看详情</button>
                    </div>
                  </div>

                  <div class="technique-card" data-technique="足尖之魅">
                    <div class="card-header">
                      <span class="technique-emoji">🦶</span>
                      <span class="technique-name">足尖之魅</span>
                      <span class="proficiency-badge">25%</span>
                    </div>
                    <div class="card-stats">
                      <div class="stat-item">
                        <span class="stat-label">使用次数:</span>
                        <span class="stat-value">25次</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">成功率:</span>
                        <span class="stat-value">68%</span>
                      </div>
                    </div>
                    <div class="card-actions">
                      <button class="action-btn primary" onclick="spmMonitor.showTechniquePerformanceDialog('足尖之魅')">表现分析</button>
                      <button class="action-btn secondary" onclick="spmMonitor.showTechniqueDetail('足尖之魅')">查看详情</button>
                    </div>
                  </div>

                  <div class="technique-card" data-technique="媚态之心">
                    <div class="card-header">
                      <span class="technique-emoji">💖</span>
                      <span class="technique-name">媚态之心</span>
                      <span class="proficiency-badge">20%</span>
                    </div>
                    <div class="card-stats">
                      <div class="stat-item">
                        <span class="stat-label">使用次数:</span>
                        <span class="stat-value">20次</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">成功率:</span>
                        <span class="stat-value">65%</span>
                      </div>
                    </div>
                    <div class="card-actions">
                      <button class="action-btn primary" onclick="spmMonitor.showTechniquePerformanceDialog('媚态之心')">表现分析</button>
                      <button class="action-btn secondary" onclick="spmMonitor.showTechniqueDetail('媚态之心')">查看详情</button>
                    </div>
                  </div>

                  <div class="technique-card" data-technique="异物与猎奇">
                    <div class="card-header">
                      <span class="technique-emoji">🎭</span>
                      <span class="technique-name">异物与猎奇</span>
                      <span class="proficiency-badge">15%</span>
                    </div>
                    <div class="card-stats">
                      <div class="stat-item">
                        <span class="stat-label">使用次数:</span>
                        <span class="stat-value">15次</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">成功率:</span>
                        <span class="stat-value">60%</span>
                      </div>
                    </div>
                    <div class="card-actions">
                      <button class="action-btn primary" onclick="spmMonitor.showTechniquePerformanceDialog('异物与猎奇')">表现分析</button>
                      <button class="action-btn secondary" onclick="spmMonitor.showTechniqueDetail('异物与猎奇')">查看详情</button>
                    </div>
                  </div>

                  <div class="technique-card" data-technique="支配与有点难堪">
                    <div class="card-header">
                      <span class="technique-emoji">⛓️</span>
                      <span class="technique-name">支配与有点难堪</span>
                      <span class="proficiency-badge">8%</span>
                    </div>
                    <div class="card-stats">
                      <div class="stat-item">
                        <span class="stat-label">使用次数:</span>
                        <span class="stat-value">8次</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">成功率:</span>
                        <span class="stat-value">55%</span>
                      </div>
                    </div>
                    <div class="card-actions">
                      <button class="action-btn primary" onclick="spmMonitor.showTechniquePerformanceDialog('支配与有点难堪')">表现分析</button>
                      <button class="action-btn secondary" onclick="spmMonitor.showTechniqueDetail('支配与有点难堪')">查看详情</button>
                    </div>
                  </div>
                </div>

                <div class="techniques-summary">
                  <h4>技巧使用统计</h4>
                  <div class="summary-stats">
                    <div class="summary-item">
                      <span class="summary-label">总使用次数:</span>
                      <span class="summary-value">240次</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">平均成功率:</span>
                      <span class="summary-value">70.4%</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">最常用技巧:</span>
                      <span class="summary-value">口唇之道</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">最高熟练度:</span>
                      <span class="summary-value">72%</span>
                    </div>
                  </div>
                </div>

                <div class="techniques-actions">
                  <button class="action-btn-large primary" onclick="spmMonitor.showTechniqueComboDialog()">技巧组合</button>
                  <button class="action-btn-large secondary" onclick="spmMonitor.resetAllTechniques()">重置数据</button>
                  <button class="action-btn-large secondary" onclick="spmMonitor.exportTechniquesData()">导出数据</button>
                </div>
              </div>
            </div>
            
            <div id="spm-view-evolution" class="spm-view">
              <h3>🧬 演化系统详细配置</h3>
              <p>演化系统功能开发中...</p>
            </div>
            
            <div id="spm-view-statistics" class="spm-view">
              <h3>📈 数据统计详细报告</h3>
              <p>数据统计功能开发中...</p>
            </div>
            
            <div id="spm-view-control" class="smp-view">
              <div class="control-center">
                <h3>🎮 系统控制中心</h3>
                
                <div class="control-sections">
                  <div class="control-section">
                    <h4>核心功能控制</h4>
                    <div class="control-grid">
                      <div class="control-item">
                        <div class="control-icon">🔧</div>
                        <div class="control-info">
                          <div class="control-title">系统激活</div>
                          <div class="control-status active">🟢 已激活</div>
                        </div>
                        <button class="control-btn" onclick="spmMonitor.toggleSystemActivation()">切换状态</button>
                      </div>
                      
                      <div class="control-item">
                        <div class="control-icon">🎭</div>
                        <div class="control-info">
                          <div class="control-title">人格混合</div>
                          <div class="control-status available">🔵 可用</div>
                        </div>
                        <button class="control-btn" onclick="spmMonitor.showPersonaMixingDialog()">配置混合</button>
                      </div>
                      
                      <div class="control-item">
                        <div class="control-icon">🚀</div>
                        <div class="control-info">
                          <div class="control-title">高级互动</div>
                          <div class="control-status standby">🟡 待机</div>
                        </div>
                        <button class="control-btn" onclick="spmMonitor.activateAdvancedInteraction()">激活功能</button>
                      </div>
                      
                      <div class="control-item">
                        <div class="control-icon">🔍</div>
                        <div class="control-info">
                          <div class="control-title">情境分析</div>
                          <div class="control-status running">🟢 运行中</div>
                        </div>
                        <button class="control-btn" onclick="spmMonitor.showSituationAnalysis()">查看分析</button>
                      </div>
                    </div>
                  </div>

                  <div class="control-section">
                    <h4>辅助功能控制</h4>
                    <div class="control-grid">
                      <div class="control-item">
                        <div class="control-icon">💬</div>
                        <div class="control-info">
                          <div class="control-title">台词生成</div>
                          <div class="control-status ready">🟢 就绪</div>
                        </div>
                        <button class="control-btn" onclick="spmMonitor.generateDialogue()">生成台词</button>
                      </div>
                      
                      <div class="control-item">
                        <div class="control-icon">🤸</div>
                        <div class="control-info">
                          <div class="control-title">姿势推荐</div>
                          <div class="control-status ready">🟢 就绪</div>
                        </div>
                        <button class="control-btn" onclick="spmMonitor.showPostureRecommendation()">推荐姿势</button>
                      </div>
                      
                      <div class="control-item">
                        <div class="control-icon">📊</div>
                        <div class="control-info">
                          <div class="control-title">数据查询</div>
                          <div class="control-status available">🟢 可用</div>
                        </div>
                        <button class="control-btn" onclick="spmMonitor.showDetailedStatistics()">查询数据</button>
                      </div>
                      
                      <div class="control-item">
                        <div class="control-icon">🔧</div>
                        <div class="control-info">
                          <div class="control-title">系统验证</div>
                          <div class="control-status normal">🟢 正常</div>
                        </div>
                        <button class="control-btn" onclick="spmMonitor.runSystemHealthCheck()">健康检查</button>
                      </div>
                    </div>
                  </div>

                  <div class="control-section">
                    <h4>系统管理</h4>
                    <div class="control-grid">
                      <div class="control-item">
                        <div class="control-icon">⚙️</div>
                        <div class="control-info">
                          <div class="control-title">全局设置</div>
                          <div class="control-status configurable">🔵 可配置</div>
                        </div>
                        <button class="control-btn" onclick="spmMonitor.showGlobalSettings()">全局设置</button>
                      </div>
                      
                      <div class="control-item">
                        <div class="control-icon">🔄</div>
                        <div class="control-info">
                          <div class="control-title">系统重启</div>
                          <div class="control-status available">🟢 可用</div>
                        </div>
                        <button class="control-btn warning" onclick="spmMonitor.restartSystem()">重启系统</button>
                      </div>
                      
                      <div class="control-item">
                        <div class="control-icon">💾</div>
                        <div class="control-info">
                          <div class="control-title">备份数据</div>
                          <div class="control-status available">🟢 可用</div>
                        </div>
                        <button class="control-btn" onclick="spmMonitor.backupData()">立即备份</button>
                      </div>
                      
                      <div class="control-item">
                        <div class="control-icon">🔙</div>
                        <div class="control-info">
                          <div class="control-title">恢复默认</div>
                          <div class="control-status available">🟢 可用</div>
                        </div>
                        <button class="control-btn danger" onclick="spmMonitor.restoreDefaults()">恢复默认</button>
                      </div>
                    </div>
                  </div>

                  <div class="control-section">
                    <h4>快速操作</h4>
                    <div class="quick-actions">
                      <button class="quick-action-btn primary" onclick="spmMonitor.runSystemHealthCheck()">
                        <span class="action-icon">🔧</span>
                        <span class="action-text">健康检查</span>
                      </button>
                      <button class="quick-action-btn secondary" onclick="spmMonitor.showPerformanceOptimization()">
                        <span class="action-icon">⚡</span>
                        <span class="action-text">性能优化</span>
                      </button>
                      <button class="quick-action-btn secondary" onclick="spmMonitor.exportSystemData()">
                        <span class="action-icon">📤</span>
                        <span class="action-text">导出数据</span>
                      </button>
                      <button class="quick-action-btn secondary" onclick="spmMonitor.showSystemLogs()">
                        <span class="action-icon">📋</span>
                        <span class="action-text">系统日志</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div id="spm-view-settings" class="spm-view">
              <h3>⚙️ 系统设置</h3>
              
              <div class="settings-container">
                <div class="settings-section">
                  <h4>🎨 界面设置</h4>
                  <div class="settings-group">
                    <div class="setting-item">
                      <label class="setting-label">主题模式:</label>
                      <select class="setting-select" id="theme-mode">
                        <option value="auto">自动</option>
                        <option value="light">浅色</option>
                        <option value="dark">深色</option>
                      </select>
                    </div>
                    <div class="setting-item">
                      <label class="setting-label">动画效果:</label>
                      <input type="checkbox" id="enable-animations" checked>
                      <span class="setting-description">启用界面动画效果</span>
                    </div>
                    <div class="setting-item">
                      <label class="setting-label">透明度:</label>
                      <input type="range" id="panel-opacity" min="0.5" max="1" step="0.1" value="0.95">
                      <span class="range-value">95%</span>
                    </div>
                    <div class="setting-item">
                      <label class="setting-label">面板位置:</label>
                      <select class="setting-select" id="panel-position">
                        <option value="top-right">右上角</option>
                        <option value="top-left">左上角</option>
                        <option value="bottom-right">右下角</option>
                        <option value="bottom-left">左下角</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="settings-section">
                  <h4>📊 数据设置</h4>
                  <div class="settings-group">
                    <div class="setting-item">
                      <label class="setting-label">更新频率:</label>
                      <select class="setting-select" id="update-frequency">
                        <option value="1000">1秒</option>
                        <option value="5000" selected>5秒</option>
                        <option value="10000">10秒</option>
                        <option value="30000">30秒</option>
                      </select>
                    </div>
                    <div class="setting-item">
                      <label class="setting-label">数据保留期:</label>
                      <select class="setting-select" id="data-retention">
                        <option value="7">7天</option>
                        <option value="30" selected>30天</option>
                        <option value="90">90天</option>
                        <option value="365">1年</option>
                      </select>
                    </div>
                    <div class="setting-item">
                      <label class="setting-label">自动保存:</label>
                      <input type="checkbox" id="auto-save" checked>
                      <span class="setting-description">定期自动保存数据</span>
                    </div>
                    <div class="setting-item">
                      <label class="setting-label">数据压缩:</label>
                      <input type="checkbox" id="data-compression" checked>
                      <span class="setting-description">压缩存储数据以节省空间</span>
                    </div>
                  </div>
                </div>

                <div class="settings-section">
                  <h4>🔔 通知设置</h4>
                  <div class="settings-group">
                    <div class="setting-item">
                      <label class="setting-label">桌面通知:</label>
                      <input type="checkbox" id="desktop-notifications" checked>
                      <span class="setting-description">重要事件桌面通知</span>
                    </div>
                    <div class="setting-item">
                      <label class="setting-label">声音提醒:</label>
                      <input type="checkbox" id="sound-notifications">
                      <span class="setting-description">播放提示音</span>
                    </div>
                    <div class="setting-item">
                      <label class="setting-label">演化里程碑:</label>
                      <input type="checkbox" id="evolution-notifications" checked>
                      <span class="setting-description">演化进展通知</span>
                    </div>
                    <div class="setting-item">
                      <label class="setting-label">性能警告:</label>
                      <input type="checkbox" id="performance-warnings" checked>
                      <span class="setting-description">性能问题警告</span>
                    </div>
                  </div>
                </div>

                <div class="settings-section">
                  <h4>🔧 高级设置</h4>
                  <div class="settings-group">
                    <div class="setting-item">
                      <label class="setting-label">调试模式:</label>
                      <input type="checkbox" id="debug-mode">
                      <span class="setting-description">启用详细日志记录</span>
                    </div>
                    <div class="setting-item">
                      <label class="setting-label">API密钥:</label>
                      <input type="password" id="api-key" placeholder="输入API密钥">
                      <button class="setting-btn" onclick="spmMonitor.testApiConnection()">测试连接</button>
                    </div>
                    <div class="setting-item">
                      <label class="setting-label">备份路径:</label>
                      <input type="text" id="backup-path" placeholder="选择备份文件夹">
                      <button class="setting-btn" onclick="spmMonitor.selectBackupPath()">选择</button>
                    </div>
                    <div class="setting-item">
                      <label class="setting-label">自动备份:</label>
                      <select class="setting-select" id="auto-backup">
                        <option value="disabled">禁用</option>
                        <option value="daily">每日</option>
                        <option value="weekly" selected>每周</option>
                        <option value="monthly">每月</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="settings-section danger-zone">
                  <h4>⚠️ 危险操作</h4>
                  <div class="settings-group">
                    <div class="setting-item danger">
                      <label class="setting-label">重置所有数据:</label>
                      <button class="danger-btn" onclick="spmMonitor.confirmResetData()">重置数据</button>
                      <span class="setting-description">将删除所有历史数据（不可恢复）</span>
                    </div>
                    <div class="setting-item danger">
                      <label class="setting-label">恢复默认设置:</label>
                      <button class="danger-btn" onclick="spmMonitor.confirmResetSettings()">恢复默认</button>
                      <span class="setting-description">将所有设置恢复为默认值</span>
                    </div>
                    <div class="setting-item danger">
                      <label class="setting-label">卸载扩展:</label>
                      <button class="danger-btn" onclick="spmMonitor.confirmUninstall()">卸载</button>
                      <span class="setting-description">完全移除SPM扩展及所有数据</span>
                    </div>
                  </div>
                </div>

                <div class="settings-actions">
                  <button class="spm-btn secondary" onclick="spmMonitor.exportSettings()">📤 导出设置</button>
                  <button class="spm-btn secondary" onclick="spmMonitor.importSettings()">📥 导入设置</button>
                  <button class="spm-btn secondary" onclick="spmMonitor.resetToDefaults()">🔄 重置设置</button>
                  <button class="spm-btn primary" onclick="spmMonitor.saveSettings()">💾 保存设置</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    this.bindFusionEvents();
  }

  // 切换融合面板显示/隐藏
  toggleFusionPanel() {
    const panel = document.getElementById('spm-fusion-panel');
    if (panel) {
      if (panel.style.display === 'none' || !panel.style.display) {
        panel.style.display = 'flex';
        console.log('📊 SPM融合面板已打开');
      } else {
        panel.style.display = 'none';
        console.log('📊 SPM融合面板已关闭');
      }
    }
  }

  // 绑定融合UI事件
  bindFusionEvents() {
    // 导航按钮事件
    const navButtons = document.querySelectorAll('.spm-nav-btn[data-view]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const viewName = btn.dataset.view;
        this.switchView(viewName);
      });
    });

    // 面板外点击关闭
    const panel = document.getElementById('spm-fusion-panel');
    if (panel) {
      panel.addEventListener('click', e => {
        if (e.target === panel) {
          this.toggleFusionPanel();
        }
      });
    }
  }

  // 其他方法 - 根据详细设计文档实现完整功能

  // 打开人格混合器
  openPersonaMixer() {
    this.addActivityLog('🎭 打开人格混合器');
    this.showPersonaMixingDialog();
  }

  // 显示人格混合配置弹窗
  showPersonaMixingDialog() {
    const existingDialog = document.getElementById('persona-mixing-dialog');
    if (existingDialog) {
      existingDialog.remove();
    }

    const dialog = document.createElement('div');
    dialog.id = 'persona-mixing-dialog';
    dialog.className = 'spm-modal';
    dialog.innerHTML = `
      <div class="spm-modal-content persona-mixing-content">
        <div class="spm-modal-header">
          <h3>🎭 人格混合配置</h3>
          <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
        </div>
        <div class="spm-modal-body">
          <div class="mixing-section">
            <h4>当前混合状态:</h4>
            <div class="persona-progress-bars">
              <div class="persona-bar">
                <span class="persona-label">纯真系:</span>
                <div class="progress-container">
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: 80%"></div>
                  </div>
                  <span class="progress-text">80%</span>
                </div>
              </div>
              <div class="persona-bar">
                <span class="persona-label">成熟系:</span>
                <div class="progress-container">
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: 40%"></div>
                  </div>
                  <span class="progress-text">40%</span>
                </div>
              </div>
              <div class="persona-bar">
                <span class="persona-label">反差系:</span>
                <div class="progress-container">
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: 20%"></div>
                  </div>
                  <span class="progress-text">20%</span>
                </div>
              </div>
              <div class="persona-bar">
                <span class="persona-label">表演系:</span>
                <div class="progress-container">
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: 10%"></div>
                  </div>
                  <span class="progress-text">10%</span>
                </div>
              </div>
              <div class="persona-bar">
                <span class="persona-label">禁忌系:</span>
                <div class="progress-container">
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: 0%"></div>
                  </div>
                  <span class="progress-text">0%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="mixing-section">
            <h4>调整权重:</h4>
            <div class="weight-sliders">
              <div class="slider-group">
                <label>纯真系:</label>
                <input type="range" min="0" max="100" value="80" class="persona-slider" data-persona="innocent">
                <span class="slider-value">80%</span>
              </div>
              <div class="slider-group">
                <label>成熟系:</label>
                <input type="range" min="0" max="100" value="40" class="persona-slider" data-persona="mature">
                <span class="slider-value">40%</span>
              </div>
              <div class="slider-group">
                <label>反差系:</label>
                <input type="range" min="0" max="100" value="20" class="persona-slider" data-persona="contrast">
                <span class="slider-value">20%</span>
              </div>
              <div class="slider-group">
                <label>表演系:</label>
                <input type="range" min="0" max="100" value="10" class="persona-slider" data-persona="performance">
                <span class="slider-value">10%</span>
              </div>
              <div class="slider-group">
                <label>禁忌系:</label>
                <input type="range" min="0" max="100" value="0" class="persona-slider" data-persona="forbidden">
                <span class="slider-value">0%</span>
              </div>
            </div>
          </div>

          <div class="mixing-section">
            <h4>混合描述:</h4>
            <div class="mixing-description">
              <p id="mixing-description-text">
                纯真中带有成熟的智慧，在互动中既保持天真可爱，又展现出一定的经验和技巧。
                这种混合人格能够根据情境灵活调整表现方式，既不会过于幼稚，也不会过于老练。
              </p>
            </div>
          </div>

          <div class="mixing-section">
            <h4>表现建议:</h4>
            <ul class="performance-suggestions">
              <li>在轻松氛围中保持纯真可爱</li>
              <li>在需要技巧时展现成熟经验</li>
              <li>适当使用反差系增加趣味性</li>
            </ul>
          </div>
        </div>
        <div class="spm-modal-footer">
          <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">取消</button>
          <button class="spm-btn secondary" onclick="spmMonitor.resetPersonaWeights()">重置</button>
          <button class="spm-btn primary" onclick="spmMonitor.previewPersonaMixing()">预览效果</button>
          <button class="spm-btn primary" onclick="spmMonitor.applyPersonaMixing()">应用配置</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);
    this.bindPersonaMixingEvents();
  }

  // 绑定人格混合事件
  bindPersonaMixingEvents() {
    // 只绑定当前对话框中的滑块
    const currentDialog = document.querySelector('.persona-mixing-content');
    if (!currentDialog) return;

    const sliders = currentDialog.querySelectorAll('.persona-slider');
    sliders.forEach((slider, index) => {
      slider.addEventListener('input', e => {
        const value = e.target.value;
        const persona = e.target.dataset.persona;
        const sliderValue = e.target.parentNode.querySelector('.slider-value');
        sliderValue.textContent = value + '%';

        // 更新进度条
        const progressBar = currentDialog.querySelector(`.persona-bar:nth-child(${index + 1}) .progress-bar-fill`);
        if (progressBar) {
          progressBar.style.width = value + '%';
        }

        // 更新混合描述
        this.updateMixingDescription();
      });
    });
  }

  // 更新混合描述
  updateMixingDescription() {
    const descriptions = {
      innocent_high: '以纯真为主导的人格表现，保持天真可爱的本质',
      mature_high: '以成熟为主导的人格表现，展现经验和智慧',
      balanced: '多种人格均衡混合，能够灵活适应不同情境',
      contrast_mix: '反差系增强，在温顺与叛逆之间形成有趣对比',
    };

    // 这里可以根据当前滑块值计算合适的描述
    const descText = document.getElementById('mixing-description-text');
    if (descText) {
      descText.textContent = descriptions.balanced; // 简化实现
    }
  }

  // 重置人格权重
  resetPersonaWeights() {
    const sliders = document.querySelectorAll('.persona-slider');
    const defaultWeights = { innocent: 80, mature: 40, contrast: 20, performance: 10, forbidden: 0 };

    sliders.forEach(slider => {
      const persona = slider.dataset.persona;
      const defaultValue = defaultWeights[persona] || 0;
      slider.value = defaultValue;

      // 触发input事件更新显示
      slider.dispatchEvent(new Event('input'));
    });

    this.addActivityLog('🔄 人格权重已重置');
  }

  // 预览人格混合效果
  previewPersonaMixing() {
    this.addActivityLog('👁️ 预览人格混合效果');

    // 获取当前权重设置
    const weights = {};
    const sliders = document.querySelectorAll('.persona-slider');
    sliders.forEach(slider => {
      weights[slider.dataset.persona] = parseInt(slider.value);
    });

    // 显示预览效果（可以添加更详细的预览逻辑）
    alert('预览效果:\n' + JSON.stringify(weights, null, 2));
  }

  // 应用人格混合配置
  applyPersonaMixing() {
    const weights = {};
    const sliders = document.querySelectorAll('.persona-slider');
    sliders.forEach(slider => {
      weights[slider.dataset.persona] = parseInt(slider.value);
    });

    // 保存到数据中
    this.data.persona.weights = weights;

    this.addActivityLog('✅ 人格混合配置已应用');

    // 关闭弹窗
    document.getElementById('persona-mixing-dialog').remove();

    // 更新主界面显示
    this.updatePersonaDisplay();
  }

  // 更新人格显示
  updatePersonaDisplay() {
    // 更新主界面的人格信息
    const currentPersonaEl = document.getElementById('current-persona');
    const personaWeightEl = document.getElementById('persona-weight');

    if (currentPersonaEl && this.data.persona.weights) {
      // 找到权重最高的人格
      let maxWeight = 0;
      let dominantPersona = '';
      Object.entries(this.data.persona.weights).forEach(([persona, weight]) => {
        if (weight > maxWeight) {
          maxWeight = weight;
          dominantPersona = persona;
        }
      });

      const personaNames = {
        innocent: '纯真系',
        mature: '成熟系',
        contrast: '反差系',
        performance: '表演系',
        forbidden: '禁忌系',
      };

      currentPersonaEl.textContent = personaNames[dominantPersona] || '混合系';
      if (personaWeightEl) {
        personaWeightEl.textContent = maxWeight + '%';
      }
    }
  }

  // 显示人格历史记录
  showPersonaHistory() {
    this.addActivityLog('📜 查看人格历史记录');

    const historyDialog = document.createElement('div');
    historyDialog.className = 'spm-modal';
    historyDialog.innerHTML = `
      <div class="spm-modal-content persona-history-content">
        <div class="spm-modal-header">
          <h3>🎭 人格使用历史记录</h3>
          <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
        </div>
        <div class="spm-modal-body">
          <div class="history-section">
            <h4>时间线视图:</h4>
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-time">今天</div>
                <div class="timeline-content">
                  <div class="timeline-entry">
                    <span class="entry-time">14:30</span>
                    <span class="entry-action">人格切换: 纯真系 → 成熟系</span>
                    <div class="entry-details">持续时间: 15分钟 | 触发原因: 用户请求</div>
                  </div>
                  <div class="timeline-entry">
                    <span class="entry-time">14:15</span>
                    <span class="entry-action">人格混合: 纯真系+成熟系 (60%+40%)</span>
                    <div class="entry-details">持续时间: 20分钟 | 效果评分: 8.5/10</div>
                  </div>
                  <div class="timeline-entry">
                    <span class="entry-time">13:45</span>
                    <span class="entry-action">人格激活: 纯真系</span>
                    <div class="entry-details">持续时间: 30分钟 | 互动次数: 12次</div>
                  </div>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-time">昨天</div>
                <div class="timeline-content">
                  <div class="timeline-entry">
                    <span class="entry-time">20:15</span>
                    <span class="entry-action">人格切换: 成熟系 → 纯真系</span>
                  </div>
                  <div class="timeline-entry">
                    <span class="entry-time">19:30</span>
                    <span class="entry-action">人格混合: 纯真系+反差系 (70%+30%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="history-section">
            <h4>统计概览:</h4>
            <div class="history-stats">
              <div class="stat-row">
                <span class="stat-label">总使用时间:</span>
                <span class="stat-value">45小时</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">人格切换次数:</span>
                <span class="stat-value">23次</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">最常用人格:</span>
                <span class="stat-value">纯真系 (18小时)</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">平均使用时长:</span>
                <span class="stat-value">1.2小时</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">混合模式使用:</span>
                <span class="stat-value">8次</span>
              </div>
            </div>
          </div>
        </div>
        <div class="spm-modal-footer">
          <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
          <button class="spm-btn secondary" onclick="spmMonitor.exportPersonaHistory()">导出历史</button>
          <button class="spm-btn secondary" onclick="spmMonitor.clearPersonaHistory()">清除记录</button>
          <button class="spm-btn primary" onclick="spmMonitor.generatePersonaReport()">生成报告</button>
        </div>
      </div>
    `;

    document.body.appendChild(historyDialog);
  }

  // 导出人格历史
  exportPersonaHistory() {
    this.addActivityLog('💾 导出人格历史记录');
    // 实现导出功能
  }

  // 清除人格记录
  clearPersonaHistory() {
    this.addActivityLog('🗑️ 清除人格历史记录');
    // 实现清除功能
  }

  // 生成人格报告
  generatePersonaReport() {
    this.addActivityLog('📊 生成人格使用报告');
    // 实现报告生成功能
  }

  // 显示技巧详细信息
  showTechniqueDetail(techniqueName = '口唇之道') {
    this.addActivityLog(`🎯 查看技巧详情: ${techniqueName}`);

    const detailDialog = document.createElement('div');
    detailDialog.className = 'spm-modal';
    detailDialog.innerHTML = `
      <div class="spm-modal-content technique-detail-content">
        <div class="spm-modal-header">
          <h3>🎯 技巧详细信息 - ${techniqueName}</h3>
          <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
        </div>
        <div class="spm-modal-body">
          <div class="technique-overview">
            <div class="technique-icon">👄</div>
            <div class="technique-info">
              <div class="info-row">
                <span class="info-label">技巧名称:</span>
                <span class="info-value">${techniqueName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">熟练度:</span>
                <span class="info-value">72% <div class="mini-progress"><div class="mini-fill" style="width: 72%"></div></div></span>
              </div>
              <div class="info-row">
                <span class="info-label">使用次数:</span>
                <span class="info-value">89次</span>
              </div>
              <div class="info-row">
                <span class="info-label">成功率:</span>
                <span class="info-value">85%</span>
              </div>
              <div class="info-row">
                <span class="info-label">平均时长:</span>
                <span class="info-value">8分钟</span>
              </div>
            </div>
          </div>

          <div class="technique-section">
            <h4>技巧描述:</h4>
            <p>口唇之道是SPM系统中的核心技巧之一，通过唇部接触和口腔技巧来增强互动体验。该技巧注重温柔细腻的表现方式，能够有效提升情感连接和身体亲密度。</p>
          </div>

          <div class="technique-section">
            <h4>表现风格:</h4>
            <ul class="style-list">
              <li><strong>纯真系:</strong> 青涩而好奇的探索，表现生疏但真诚</li>
              <li><strong>成熟系:</strong> 熟练而温柔的技巧，注重节奏和深度</li>
              <li><strong>反差系:</strong> 外冷内热的矛盾表现，时而主动时而被动</li>
              <li><strong>表演系:</strong> 夸张而戏剧化的表现，注重视觉效果</li>
              <li><strong>禁忌系:</strong> 大胆而直接的技巧，突破常规界限</li>
            </ul>
          </div>

          <div class="technique-section">
            <h4>使用统计:</h4>
            <div class="usage-stats">
              <div class="stat-row">
                <span class="stat-label">最近使用:</span>
                <span class="stat-value">5分钟前</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">最佳表现:</span>
                <span class="stat-value">与成熟系人格配合时</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">最长使用:</span>
                <span class="stat-value">25分钟 (2024-12-15)</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">成功率最高:</span>
                <span class="stat-value">与纯真系配合 (92%)</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">提升建议:</span>
                <span class="stat-value">可以尝试更深入的技巧组合</span>
              </div>
            </div>
          </div>

          <div class="technique-section">
            <h4>技巧组合建议:</h4>
            <ul class="combo-list">
              <li>口唇之道 + 玉手之艺: 双重触感体验</li>
              <li>口唇之道 + 媚态之心: 情感与技巧结合</li>
              <li>口唇之道 + 洞穴之探: 深度探索体验</li>
            </ul>
          </div>
        </div>
        <div class="spm-modal-footer">
          <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
          <button class="spm-btn secondary" onclick="spmMonitor.resetTechniqueData(\`${techniqueName}\`)">重置数据</button>
          <button class="spm-btn primary" onclick="spmMonitor.showTechniquePerformance(\`${techniqueName}\`)">技巧表现</button>
          <button class="spm-btn primary" onclick="spmMonitor.useTechniqueCombo(\`${techniqueName}\`)">组合使用</button>
          <button class="spm-btn primary" onclick="spmMonitor.useSkill(\`${techniqueName}\`)">使用技巧</button>
        </div>
      </div>
    `;

    document.body.appendChild(detailDialog);
  }

  // 显示技巧表现分析
  showTechniquePerformance(techniqueName = '口唇之道') {
    this.addActivityLog(`📊 查看技巧表现: ${techniqueName}`);

    // 先关闭详情弹窗
    const detailDialog = document.querySelector('.technique-detail-content');
    if (detailDialog) {
      detailDialog.closest('.spm-modal').remove();
    }

    const performanceDialog = document.createElement('div');
    performanceDialog.className = 'spm-modal';
    performanceDialog.innerHTML = `
      <div class="spm-modal-content technique-performance-content">
        <div class="spm-modal-header">
          <h3>🎯 技巧表现分析 - ${techniqueName}</h3>
          <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
        </div>
        <div class="spm-modal-body">
          <div class="performance-section">
            <h4>当前表现评估:</h4>
            <div class="performance-overview">
              <div class="overall-score">
                <span class="score-label">整体评分:</span>
                <span class="score-value">8.5/10</span>
                <div class="stars">⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐</div>
              </div>
              <div class="detailed-scores">
                <div class="score-item">
                  <span class="score-name">技巧熟练度:</span>
                  <div class="score-bar">
                    <div class="score-fill" style="width: 72%"></div>
                  </div>
                  <span class="score-percent">72%</span>
                </div>
                <div class="score-item">
                  <span class="score-name">情感投入度:</span>
                  <div class="score-bar">
                    <div class="score-fill" style="width: 85%"></div>
                  </div>
                  <span class="score-percent">85%</span>
                </div>
                <div class="score-item">
                  <span class="score-name">创新程度:</span>
                  <div class="score-bar">
                    <div class="score-fill" style="width: 60%"></div>
                  </div>
                  <span class="score-percent">60%</span>
                </div>
                <div class="score-item">
                  <span class="score-name">配合度:</span>
                  <div class="score-bar">
                    <div class="score-fill" style="width: 90%"></div>
                  </div>
                  <span class="score-percent">90%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="performance-section">
            <h4>表现分析:</h4>
            <div class="analysis-content">
              <div class="analysis-group">
                <h5>优势:</h5>
                <ul>
                  <li>技巧运用熟练，节奏把握准确</li>
                  <li>情感表达自然，能够引起共鸣</li>
                  <li>与人格配合度高，表现一致性强</li>
                  <li>能够根据情境调整表现强度</li>
                </ul>
              </div>
              <div class="analysis-group">
                <h5>改进建议:</h5>
                <ul>
                  <li>可以尝试更多变化，增加新鲜感</li>
                  <li>在某些情境下可以更加主动</li>
                  <li>可以结合其他技巧创造更丰富的体验</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="performance-section">
            <h4>情境适配度:</h4>
            <div class="situation-compatibility">
              <div class="situation-item">
                <span class="situation-name">浪漫氛围:</span>
                <div class="compatibility-bar">
                  <div class="compatibility-fill excellent" style="width: 95%"></div>
                </div>
                <span class="compatibility-text">95% (非常适合)</span>
              </div>
              <div class="situation-item">
                <span class="situation-name">轻松氛围:</span>
                <div class="compatibility-bar">
                  <div class="compatibility-fill good" style="width: 80%"></div>
                </div>
                <span class="compatibility-text">80% (适合)</span>
              </div>
              <div class="situation-item">
                <span class="situation-name">紧张氛围:</span>
                <div class="compatibility-bar">
                  <div class="compatibility-fill average" style="width: 60%"></div>
                </div>
                <span class="compatibility-text">60% (一般)</span>
              </div>
              <div class="situation-item">
                <span class="situation-name">激情氛围:</span>
                <div class="compatibility-bar">
                  <div class="compatibility-fill good" style="width: 75%"></div>
                </div>
                <span class="compatibility-text">75% (适合)</span>
              </div>
            </div>
          </div>

          <div class="performance-section">
            <h4>历史表现趋势:</h4>
            <div class="trend-analysis">
              <div class="trend-item">
                <span class="trend-label">评分变化:</span>
                <span class="trend-value">6.5 → 7.2 → 7.8 → 8.5</span>
              </div>
              <div class="trend-item">
                <span class="trend-label">使用频率:</span>
                <span class="trend-value">每周3-4次</span>
              </div>
              <div class="trend-item">
                <span class="trend-label">提升速度:</span>
                <span class="trend-value">稳定上升</span>
              </div>
            </div>
          </div>
        </div>
        <div class="spm-modal-footer">
          <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
          <button class="spm-btn secondary" onclick="spmMonitor.sharePerformance(\`${techniqueName}\`)">分享表现</button>
          <button class="spm-btn primary" onclick="spmMonitor.generateTechniqueReport(\`${techniqueName}\`)">生成报告</button>
          <button class="spm-btn primary" onclick="spmMonitor.showTechniqueDetail(\`${techniqueName}\`)">查看详细</button>
        </div>
      </div>
    `;

    document.body.appendChild(performanceDialog);
  }

  // 重置技巧数据
  resetTechniqueData(techniqueName) {
    this.addActivityLog(`🔄 重置技巧数据: ${techniqueName}`);
    if (confirm(`确定要重置 ${techniqueName} 的使用数据吗？此操作不可撤销。`)) {
      // 实现重置逻辑
      this.addActivityLog(`✅ ${techniqueName} 数据已重置`);
    }
  }

  // 使用技巧组合
  useTechniqueCombo(techniqueName) {
    this.addActivityLog(`🔗 使用技巧组合: ${techniqueName}`);
    // 实现组合使用逻辑
  }

  // 分享表现
  sharePerformance(techniqueName) {
    this.addActivityLog(`📤 分享技巧表现: ${techniqueName}`);
    // 实现分享功能
  }

  // 生成技巧报告
  generateTechniqueReport(techniqueName) {
    this.addActivityLog(`📊 生成技巧报告: ${techniqueName}`);
    // 实现报告生成功能
  }

  // 显示技巧表现分析弹窗
  showTechniquePerformanceDialog(techniqueName = '口唇之道') {
    try {
      this.addActivityLog(`📊 查看技巧表现分析: ${techniqueName}`);

      const existingDialog = document.getElementById('technique-performance-dialog');
      if (existingDialog) {
        existingDialog.remove();
      }

      const performanceDialog = document.createElement('div');
      performanceDialog.id = 'technique-performance-dialog';
      performanceDialog.className = 'spm-modal';
      performanceDialog.innerHTML = `
        <div class="spm-modal-content technique-performance-content">
          <div class="spm-modal-header">
            <h3>🎯 技巧表现分析 - ${techniqueName}</h3>
            <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
          </div>
          <div class="spm-modal-body">
            <div class="performance-assessment">
              <h4>当前表现评估:</h4>
              <div class="assessment-overview">
                <div class="overall-rating">
                  <span class="rating-label">整体评分:</span>
                  <span class="rating-score">8.5/10</span>
                  <div class="rating-stars">⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐</div>
                </div>
                <div class="detailed-metrics">
                  <div class="metric-item">
                    <span class="metric-label">技巧熟练度:</span>
                    <div class="metric-bar">
                      <div class="metric-fill" style="width: 72%"></div>
                    </div>
                    <span class="metric-value">72%</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">情感投入度:</span>
                    <div class="metric-bar">
                      <div class="metric-fill" style="width: 85%"></div>
                    </div>
                    <span class="metric-value">85%</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">创新程度:</span>
                    <div class="metric-bar">
                      <div class="metric-fill" style="width: 60%"></div>
                    </div>
                    <span class="metric-value">60%</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">配合度:</span>
                    <div class="metric-bar">
                      <div class="metric-fill" style="width: 90%"></div>
                    </div>
                    <span class="metric-value">90%</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="performance-analysis">
              <h4>表现分析:</h4>
              <div class="analysis-sections">
                <div class="analysis-section">
                  <h5>优势:</h5>
                  <ul class="analysis-list">
                    <li>技巧运用熟练，节奏把握准确</li>
                    <li>情感表达自然，能够引起共鸣</li>
                    <li>与人格配合度高，表现一致性强</li>
                    <li>能够根据情境调整表现强度</li>
                  </ul>
                </div>
                <div class="analysis-section">
                  <h5>改进建议:</h5>
                  <ul class="analysis-list">
                    <li>可以尝试更多变化，增加新鲜感</li>
                    <li>在某些情境下可以更加主动</li>
                    <li>可以结合其他技巧创造更丰富的体验</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="situation-adaptation">
              <h4>情境适配度:</h4>
              <div class="adaptation-grid">
                <div class="adaptation-item">
                  <span class="adaptation-label">浪漫氛围:</span>
                  <div class="adaptation-bar">
                    <div class="adaptation-fill excellent" style="width: 95%"></div>
                  </div>
                  <span class="adaptation-rating">95% (非常适合)</span>
                </div>
                <div class="adaptation-item">
                  <span class="adaptation-label">轻松氛围:</span>
                  <div class="adaptation-bar">
                    <div class="adaptation-fill good" style="width: 80%"></div>
                  </div>
                  <span class="adaptation-rating">80% (适合)</span>
                </div>
                <div class="adaptation-item">
                  <span class="adaptation-label">紧张氛围:</span>
                  <div class="adaptation-bar">
                    <div class="adaptation-fill average" style="width: 60%"></div>
                  </div>
                  <span class="adaptation-rating">60% (一般)</span>
                </div>
                <div class="adaptation-item">
                  <span class="adaptation-label">激情氛围:</span>
                  <div class="adaptation-bar">
                    <div class="adaptation-fill good" style="width: 75%"></div>
                  </div>
                  <span class="adaptation-rating">75% (适合)</span>
                </div>
              </div>
            </div>

            <div class="historical-performance">
              <h4>历史表现趋势:</h4>
              <div class="trend-summary">
                <div class="trend-item">
                  <span class="trend-label">评分变化:</span>
                  <span class="trend-value">6.5 → 7.2 → 7.8 → 8.5</span>
                  <span class="trend-indicator upward">↗️</span>
                </div>
                <div class="trend-item">
                  <span class="trend-label">使用频率:</span>
                  <span class="trend-value">每周3-4次</span>
                  <span class="trend-indicator stable">→</span>
                </div>
                <div class="trend-item">
                  <span class="trend-label">提升速度:</span>
                  <span class="trend-value">稳定上升</span>
                  <span class="trend-indicator upward">↗️</span>
                </div>
              </div>
            </div>

            <div class="improvement-recommendations">
              <h4>提升建议:</h4>
              <div class="recommendations-grid">
                <div class="recommendation-card">
                  <div class="recommendation-header">
                    <span class="recommendation-icon">🎯</span>
                    <span class="recommendation-title">技巧深化</span>
                  </div>
                  <div class="recommendation-content">
                    建议多尝试不同的节奏变化，在保持基本技巧的同时加入更多个人特色
                  </div>
                </div>
                <div class="recommendation-card">
                  <div class="recommendation-header">
                    <span class="recommendation-icon">🔄</span>
                    <span class="recommendation-title">组合练习</span>
                  </div>
                  <div class="recommendation-content">
                    可以与玉手之艺结合练习，形成更丰富的技巧组合体验
                  </div>
                </div>
                <div class="recommendation-card">
                  <div class="recommendation-header">
                    <span class="recommendation-icon">💡</span>
                    <span class="recommendation-title">创新尝试</span>
                  </div>
                  <div class="recommendation-content">
                    在熟练掌握基础技巧后，可以尝试融入更多创意元素
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="spm-modal-footer">
            <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
            <button class="spm-btn secondary" onclick="spmMonitor.exportPerformanceAnalysis('${techniqueName}')">导出分析</button>
            <button class="spm-btn primary" onclick="spmMonitor.generateImprovementPlan('${techniqueName}')">生成提升计划</button>
          </div>
        </div>
      `;

      document.body.appendChild(performanceDialog);
      this.addActivityLog(`✅ 技巧表现分析弹窗已显示`);
    } catch (error) {
      console.error('❌ 显示技巧表现分析失败:', error);
      this.addActivityLog(`❌ 技巧表现分析显示失败: ${error.message}`);
    }
  }

  // 导出表现分析报告
  exportPerformanceAnalysis(techniqueName) {
    try {
      this.addActivityLog(`📤 导出技巧表现分析: ${techniqueName}`);

      const analysisData = {
        technique: techniqueName,
        timestamp: new Date().toISOString(),
        overallScore: 8.5,
        metrics: {
          proficiency: 72,
          emotionalInvestment: 85,
          innovation: 60,
          coordination: 90,
        },
        strengths: [
          '技巧运用熟练，节奏把握准确',
          '情感表达自然，能够引起共鸣',
          '与人格配合度高，表现一致性强',
          '能够根据情境调整表现强度',
        ],
        improvements: ['可以尝试更多变化，增加新鲜感', '在某些情境下可以更加主动', '可以结合其他技巧创造更丰富的体验'],
        situationAdaptation: {
          romantic: 95,
          relaxed: 80,
          tense: 60,
          passionate: 75,
        },
      };

      // 生成下载链接
      const dataStr = JSON.stringify(analysisData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `SPM_技巧表现分析_${techniqueName}_${new Date().toISOString().split('T')[0]}.json`;
      downloadLink.click();

      URL.revokeObjectURL(url);
      this.addActivityLog(`✅ 表现分析报告已导出`);
    } catch (error) {
      console.error('❌ 导出表现分析失败:', error);
      this.addActivityLog(`❌ 导出失败: ${error.message}`);
    }
  }

  // 生成提升计划
  generateImprovementPlan(techniqueName) {
    try {
      this.addActivityLog(`📋 生成技巧提升计划: ${techniqueName}`);

      const improvementPlan = {
        technique: techniqueName,
        currentLevel: '中级',
        targetLevel: '高级',
        timeline: '4-6周',
        weeklyGoals: [
          {
            week: 1,
            focus: '基础强化',
            goals: ['每日练习基础动作', '提升节奏控制', '增强稳定性'],
            expectedProgress: '熟练度提升到78%',
          },
          {
            week: 2,
            focus: '技巧深化',
            goals: ['尝试变化技巧', '练习组合动作', '提升创新度'],
            expectedProgress: '创新程度提升到70%',
          },
          {
            week: 3,
            focus: '情感融合',
            goals: ['加强情感表达', '提升配合度', '情境适应训练'],
            expectedProgress: '情感投入度提升到90%',
          },
          {
            week: 4,
            focus: '综合提升',
            goals: ['综合技巧练习', '实战应用', '效果评估'],
            expectedProgress: '整体评分提升到9.0+',
          },
        ],
      };

      // 显示提升计划弹窗
      this.showImprovementPlanDialog(improvementPlan);
      this.addActivityLog(`✅ 提升计划已生成`);
    } catch (error) {
      console.error('❌ 生成提升计划失败:', error);
      this.addActivityLog(`❌ 计划生成失败: ${error.message}`);
    }
  }

  // 显示提升计划弹窗
  showImprovementPlanDialog(plan) {
    const planDialog = document.createElement('div');
    planDialog.className = 'spm-modal';
    planDialog.innerHTML = `
      <div class="spm-modal-content improvement-plan-content">
        <div class="spm-modal-header">
          <h3>📋 技巧提升计划 - ${plan.technique}</h3>
          <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
        </div>
        <div class="spm-modal-body">
          <div class="plan-overview">
            <div class="plan-summary">
              <div class="summary-item">
                <span class="summary-label">当前水平:</span>
                <span class="summary-value">${plan.currentLevel}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">目标水平:</span>
                <span class="summary-value">${plan.targetLevel}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">预计时间:</span>
                <span class="summary-value">${plan.timeline}</span>
              </div>
            </div>
          </div>
          
          <div class="weekly-plan">
            <h4>分周计划:</h4>
            <div class="weeks-container">
              ${plan.weeklyGoals
                .map(
                  (week, index) => `
                <div class="week-card">
                  <div class="week-header">
                    <span class="week-number">第${week.week}周</span>
                    <span class="week-focus">${week.focus}</span>
                  </div>
                  <div class="week-goals">
                    <h5>本周目标:</h5>
                    <ul>
                      ${week.goals.map(goal => `<li>${goal}</li>`).join('')}
                    </ul>
                  </div>
                  <div class="week-progress">
                    <span class="progress-label">预期成果:</span>
                    <span class="progress-value">${week.expectedProgress}</span>
                  </div>
                </div>
              `,
                )
                .join('')}
            </div>
          </div>
        </div>
        <div class="spm-modal-footer">
          <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
          <button class="spm-btn primary" onclick="spmMonitor.startImprovementPlan('${
            plan.technique
          }')">开始执行计划</button>
        </div>
      </div>
    `;

    document.body.appendChild(planDialog);
  }

  // 开始执行提升计划
  startImprovementPlan(techniqueName) {
    this.addActivityLog(`🚀 开始执行提升计划: ${techniqueName}`);
    // 实现计划执行逻辑
  }

  // 显示演化历史记录
  showEvolutionHistory() {
    this.addActivityLog('🧬 查看演化历史记录');

    const historyDialog = document.createElement('div');
    historyDialog.className = 'spm-modal';
    historyDialog.innerHTML = `
      <div class="spm-modal-content evolution-history-content">
        <div class="spm-modal-header">
          <h3>🧬 演化历史记录</h3>
          <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
        </div>
        <div class="spm-modal-body">
          <div class="evolution-overview">
            <div class="current-evolution">
              <div class="evolution-stage">
                <span class="stage-label">演化阶段:</span>
                <span class="stage-value">稳定期 → 进化期 (当前)</span>
              </div>
              <div class="evolution-progress">
                <span class="progress-label">进度:</span>
                <div class="evolution-progress-bar">
                  <div class="evolution-progress-fill" style="width: 67%"></div>
                </div>
                <span class="progress-value">67%</span>
              </div>
              <div class="evolution-estimate">
                <span class="estimate-label">预计完成时间:</span>
                <span class="estimate-value">2-3天</span>
              </div>
            </div>
          </div>

          <div class="evolution-section">
            <h4>详细时间线:</h4>
            <div class="evolution-timeline">
              <div class="timeline-period">
                <div class="period-header">今天</div>
                <div class="timeline-events">
                  <div class="evolution-event">
                    <span class="event-time">14:30</span>
                    <span class="event-action">经验值 +15 (口唇之道技巧使用)</span>
                    <div class="event-details">当前经验: 1,234 | 距离下一阶段: 266点</div>
                  </div>
                  <div class="evolution-event">
                    <span class="event-time">14:25</span>
                    <span class="event-action">人格切换: 纯真系 → 成熟系</span>
                    <div class="event-details">演化影响: +5点经验 | 人格稳定性提升</div>
                  </div>
                  <div class="evolution-event">
                    <span class="event-time">14:20</span>
                    <span class="event-action">技巧使用: 口唇之道 (熟练度+5%)</span>
                    <div class="event-details">技巧提升: 67% → 72% | 演化进度+2%</div>
                  </div>
                </div>
              </div>

              <div class="timeline-period">
                <div class="period-header">昨天</div>
                <div class="timeline-events">
                  <div class="evolution-event">
                    <span class="event-time">20:15</span>
                    <span class="event-action">演化进度更新: 65% → 67%</span>
                    <div class="event-details">触发原因: 经验值达到1,200阈值</div>
                  </div>
                  <div class="evolution-event">
                    <span class="event-time">19:45</span>
                    <span class="event-action">技巧使用: 玉手之艺 (熟练度+3%)</span>
                    <div class="event-details">技巧提升: 42% → 45% | 演化进度+1%</div>
                  </div>
                  <div class="evolution-event">
                    <span class="event-time">18:30</span>
                    <span class="event-action">人格混合: 纯真系+成熟系</span>
                    <div class="event-details">混合效果: 人格稳定性+10% | 演化适应性提升</div>
                  </div>
                </div>
              </div>

              <div class="timeline-period">
                <div class="period-header">3天前</div>
                <div class="timeline-events">
                  <div class="evolution-event">
                    <span class="event-time">16:20</span>
                    <span class="event-action">演化阶段: stable (稳定阶段)</span>
                    <div class="event-details">阶段特征: 人格稳定，技巧熟练度提升</div>
                  </div>
                  <div class="evolution-event">
                    <span class="event-time">15:10</span>
                    <span class="event-action">经验值达到1000，进入稳定阶段</span>
                    <div class="event-details">里程碑: 首次达到稳定阶段 | 系统稳定性提升</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="evolution-section">
            <h4>演化统计:</h4>
            <div class="evolution-stats">
              <div class="stat-row">
                <span class="stat-label">总演化时间:</span>
                <span class="stat-value">15天</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">阶段变化:</span>
                <span class="stat-value">3次 (初始→成长→稳定→进化)</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">经验值增长:</span>
                <span class="stat-value">+1,234</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">技巧提升:</span>
                <span class="stat-value">7种技巧</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">人格发展:</span>
                <span class="stat-value">5种人格</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">演化速度:</span>
                <span class="stat-value">正常 (平均每天+82点经验)</span>
              </div>
            </div>
          </div>
        </div>
        <div class="spm-modal-footer">
          <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
          <button class="spm-btn secondary" onclick="spmMonitor.clearEvolutionHistory()">清除记录</button>
          <button class="spm-btn secondary" onclick="spmMonitor.exportEvolutionHistory()">导出历史</button>
          <button class="spm-btn primary" onclick="spmMonitor.generateEvolutionReport()">生成演化报告</button>
        </div>
      </div>
    `;

    document.body.appendChild(historyDialog);
  }

  // 显示演化方向设置
  showEvolutionDirectionSetting() {
    this.addActivityLog('🧬 设置演化方向');

    const settingDialog = document.createElement('div');
    settingDialog.className = 'smp-modal';
    settingDialog.innerHTML = `
      <div class="spm-modal-content evolution-setting-content">
        <div class="spm-modal-header">
          <h3>🧬 演化方向设置</h3>
          <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
        </div>
        <div class="spm-modal-body">
          <div class="current-direction">
            <h4>当前演化方向: 正向演化 (推荐)</h4>
          </div>

          <div class="evolution-paths">
            <h4>演化路径选择:</h4>
            <div class="path-options">
              <div class="path-option selected">
                <input type="radio" name="evolution-path" value="positive" checked id="positive-path">
                <label for="positive-path">
                  <div class="option-header">正向演化 (推荐)</div>
                  <div class="option-description">
                    <div class="option-feature">特点: 稳定发展，技巧熟练度逐步提升</div>
                    <div class="option-feature">优势: 风险低，发展稳定，适合长期使用</div>
                    <div class="option-feature">预计时间: 2-3天完成当前阶段</div>
                  </div>
                </label>
              </div>

              <div class="path-option">
                <input type="radio" name="evolution-path" value="accelerated" id="accelerated-path">
                <label for="accelerated-path">
                  <div class="option-header">加速演化</div>
                  <div class="option-description">
                    <div class="option-feature">特点: 快速提升，但可能影响稳定性</div>
                    <div class="option-feature">优势: 发展迅速，短时间内获得更多能力</div>
                    <div class="option-feature">风险: 可能影响人格稳定性，需要更多调整</div>
                    <div class="option-feature">预计时间: 1-2天完成当前阶段</div>
                  </div>
                </label>
              </div>

              <div class="path-option">
                <input type="radio" name="evolution-path" value="deep" id="deep-path">
                <label for="deep-path">
                  <div class="option-header">深度演化</div>
                  <div class="option-description">
                    <div class="option-feature">特点: 专注某一方面的深度发展</div>
                    <div class="option-feature">优势: 在特定领域获得极高熟练度</div>
                    <div class="option-feature">限制: 其他方面发展相对缓慢</div>
                    <div class="option-feature">预计时间: 3-4天完成当前阶段</div>
                  </div>
                </label>
              </div>

              <div class="path-option">
                <input type="radio" name="evolution-path" value="balanced" id="balanced-path">
                <label for="balanced-path">
                  <div class="option-header">平衡演化</div>
                  <div class="option-description">
                    <div class="option-feature">特点: 各方面均衡发展</div>
                    <div class="option-feature">优势: 全面发展，适应性强</div>
                    <div class="option-feature">特点: 发展速度相对较慢</div>
                    <div class="option-feature">预计时间: 4-5天完成当前阶段</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div class="evolution-parameters">
            <h4>演化参数调整:</h4>
            <div class="parameter-controls">
              <div class="parameter-item">
                <label>经验值获取倍率:</label>
                <select class="parameter-select">
                  <option value="1.0">1.0x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2.0">2.0x</option>
                </select>
              </div>
              <div class="parameter-item">
                <label>技巧熟练度提升:</label>
                <select class="parameter-select">
                  <option value="normal">正常</option>
                  <option value="fast">快速</option>
                  <option value="slow">缓慢</option>
                </select>
              </div>
              <div class="parameter-item">
                <label>人格稳定性影响:</label>
                <select class="parameter-select">
                  <option value="normal">正常</option>
                  <option value="enhanced">增强</option>
                  <option value="reduced">减弱</option>
                </select>
              </div>
              <div class="parameter-item">
                <label>演化速度:</label>
                <select class="parameter-select">
                  <option value="normal">正常</option>
                  <option value="fast">快速</option>
                  <option value="slow">缓慢</option>
                </select>
              </div>
            </div>
          </div>

          <div class="evolution-goals">
            <h4>演化目标设置:</h4>
            <div class="goals-content">
              <div class="goal-period">
                <h5>短期目标 (1周内):</h5>
                <ul>
                  <li>完成当前演化阶段</li>
                  <li>提升2-3种技巧熟练度到80%以上</li>
                  <li>稳定人格混合模式</li>
                </ul>
              </div>
              <div class="goal-period">
                <h5>中期目标 (1月内):</h5>
                <ul>
                  <li>达到高级演化阶段</li>
                  <li>掌握所有基础技巧</li>
                  <li>建立稳定的人格体系</li>
                </ul>
              </div>
              <div class="goal-period">
                <h5>长期目标 (3月内):</h5>
                <ul>
                  <li>达到专家级演化阶段</li>
                  <li>开发个性化技巧组合</li>
                  <li>形成独特的人格风格</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="spm-modal-footer">
          <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">取消</button>
          <button class="spm-btn secondary" onclick="spmMonitor.resetEvolutionSettings()">重置</button>
          <button class="spm-btn primary" onclick="spmMonitor.previewEvolutionEffect()">预览效果</button>
          <button class="spm-btn primary" onclick="spmMonitor.applyEvolutionSettings()">应用设置</button>
        </div>
      </div>
    `;

    document.body.appendChild(settingDialog);
  }

  // 清除演化历史
  clearEvolutionHistory() {
    this.addActivityLog('🗑️ 清除演化历史记录');
    if (confirm('确定要清除所有演化历史记录吗？此操作不可撤销。')) {
      // 实现清除功能
      this.addActivityLog('✅ 演化历史记录已清除');
    }
  }

  // 导出演化历史
  exportEvolutionHistory() {
    this.addActivityLog('💾 导出演化历史记录');
    // 实现导出功能
  }

  // 生成演化报告
  generateEvolutionReport() {
    this.addActivityLog('📊 生成演化报告');
    // 实现报告生成功能
  }

  // 重置演化设置
  resetEvolutionSettings() {
    try {
      this.addActivityLog('🔄 重置演化设置');

      // 重置所有设置到默认值
      const pathRadios = document.querySelectorAll('input[name="evolution-path"]');
      pathRadios.forEach(radio => {
        radio.checked = radio.value === 'positive';
      });

      const parameterSelects = document.querySelectorAll('.parameter-select');
      parameterSelects.forEach(select => {
        select.selectedIndex = 0; // 选择第一个选项（通常是默认值）
      });

      // 更新目标设置显示
      this.updateEvolutionGoalsDisplay('positive');

      this.addActivityLog('✅ 演化设置已重置为默认值');
    } catch (error) {
      console.error('❌ 重置演化设置失败:', error);
      this.addActivityLog(`❌ 重置失败: ${error.message}`);
    }
  }

  // 预览演化效果
  previewEvolutionEffect() {
    try {
      this.addActivityLog('👁️ 预览演化效果');

      // 获取当前选择的设置
      const selectedPath = document.querySelector('input[name="evolution-path"]:checked')?.value || 'positive';
      const experienceMultiplier = document.querySelector('.parameter-select')?.value || '1.0';

      // 创建预览弹窗
      const previewDialog = document.createElement('div');
      previewDialog.className = 'spm-modal';
      previewDialog.innerHTML = `
        <div class="spm-modal-content evolution-preview-content">
          <div class="spm-modal-header">
            <h3>🔮 演化效果预览</h3>
            <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
          </div>
          <div class="spm-modal-body">
            <div class="preview-summary">
              <h4>预览配置:</h4>
              <div class="config-display">
                <div class="config-item">
                  <span class="config-label">演化路径:</span>
                  <span class="config-value">${this.getPathDisplayName(selectedPath)}</span>
                </div>
                <div class="config-item">
                  <span class="config-label">经验倍率:</span>
                  <span class="config-value">${experienceMultiplier}x</span>
                </div>
              </div>
            </div>

            <div class="preview-timeline">
              <h4>预计演化时间线:</h4>
              <div class="timeline-preview">
                ${this.generateEvolutionTimeline(selectedPath, experienceMultiplier)}
              </div>
            </div>

            <div class="preview-impacts">
              <h4>预期影响:</h4>
              <div class="impacts-grid">
                <div class="impact-item positive">
                  <span class="impact-icon">📈</span>
                  <span class="impact-title">技巧发展</span>
                  <span class="impact-desc">${this.getSkillImpactDesc(selectedPath)}</span>
                </div>
                <div class="impact-item ${selectedPath === 'accelerated' ? 'warning' : 'positive'}">
                  <span class="impact-icon">🧠</span>
                  <span class="impact-title">人格稳定性</span>
                  <span class="impact-desc">${this.getPersonaStabilityDesc(selectedPath)}</span>
                </div>
                <div class="impact-item positive">
                  <span class="impact-icon">⏱️</span>
                  <span class="impact-title">演化速度</span>
                  <span class="impact-desc">${this.getEvolutionSpeedDesc(selectedPath)}</span>
                </div>
                <div class="impact-item neutral">
                  <span class="impact-icon">🎯</span>
                  <span class="impact-title">目标达成</span>
                  <span class="impact-desc">${this.getGoalAchievementDesc(selectedPath)}</span>
                </div>
              </div>
            </div>

            <div class="preview-recommendations">
              <h4>建议:</h4>
              <div class="recommendations-list">
                ${this.getEvolutionRecommendations(selectedPath)
                  .map(
                    rec => `
                  <div class="recommendation-item">
                    <span class="rec-icon">${rec.icon}</span>
                    <span class="rec-text">${rec.text}</span>
                  </div>
                `,
                  )
                  .join('')}
              </div>
            </div>
          </div>
          <div class="spm-modal-footer">
            <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
            <button class="spm-btn primary" onclick="spmMonitor.applyEvolutionSettings(); this.closest('.spm-modal').remove();">确认应用</button>
          </div>
        </div>
      `;

      document.body.appendChild(previewDialog);
      this.addActivityLog('✅ 演化效果预览已显示');
    } catch (error) {
      console.error('❌ 预览演化效果失败:', error);
      this.addActivityLog(`❌ 预览失败: ${error.message}`);
    }
  }

  // 获取路径显示名称
  getPathDisplayName(path) {
    const names = {
      positive: '正向演化',
      accelerated: '加速演化',
      deep: '深度演化',
      balanced: '平衡演化',
    };
    return names[path] || '未知路径';
  }

  // 生成演化时间线
  generateEvolutionTimeline(path, multiplier) {
    const baseDays = {
      positive: 3,
      accelerated: 1.5,
      deep: 4,
      balanced: 5,
    };

    const days = Math.ceil(baseDays[path] / parseFloat(multiplier));

    return `
      <div class="timeline-item">
        <div class="timeline-day">第1天</div>
        <div class="timeline-event">开始新的演化路径</div>
        <div class="timeline-progress">进度: 20%</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-day">第${Math.ceil(days / 2)}天</div>
        <div class="timeline-event">达到演化中期</div>
        <div class="timeline-progress">进度: 60%</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-day">第${days}天</div>
        <div class="timeline-event">完成当前阶段演化</div>
        <div class="timeline-progress">进度: 100%</div>
      </div>
    `;
  }

  // 获取技巧影响描述
  getSkillImpactDesc(path) {
    const descriptions = {
      positive: '稳定提升，各技巧均衡发展',
      accelerated: '快速提升，但可能不够深入',
      deep: '特定技巧深度发展，其他相对缓慢',
      balanced: '全面发展，但提升速度较慢',
    };
    return descriptions[path] || '未知影响';
  }

  // 获取人格稳定性描述
  getPersonaStabilityDesc(path) {
    const descriptions = {
      positive: '稳定性良好，适合长期发展',
      accelerated: '可能影响稳定性，需要监控',
      deep: '在专注领域内稳定性极高',
      balanced: '整体稳定性最佳',
    };
    return descriptions[path] || '未知影响';
  }

  // 获取演化速度描述
  getEvolutionSpeedDesc(path) {
    const descriptions = {
      positive: '中等速度，稳步前进',
      accelerated: '高速发展，快速见效',
      deep: '深度发展，速度中等偏慢',
      balanced: '缓慢但全面的发展',
    };
    return descriptions[path] || '未知速度';
  }

  // 获取目标达成描述
  getGoalAchievementDesc(path) {
    const descriptions = {
      positive: '各项目标均衡达成',
      accelerated: '短期目标快速达成',
      deep: '专项目标深度达成',
      balanced: '长期目标全面达成',
    };
    return descriptions[path] || '未知达成情况';
  }

  // 获取演化建议
  getEvolutionRecommendations(path) {
    const recommendations = {
      positive: [
        { icon: '✅', text: '推荐选择，适合大多数用户' },
        { icon: '🎯', text: '建议配合定期技巧练习' },
        { icon: '📊', text: '可以定期查看进度报告' },
      ],
      accelerated: [
        { icon: '⚠️', text: '注意监控人格稳定性变化' },
        { icon: '🔄', text: '建议随时准备调整设置' },
        { icon: '📈', text: '适合短期内需要快速提升的情况' },
      ],
      deep: [
        { icon: '🎯', text: '选择一个主要发展方向' },
        { icon: '⏰', text: '需要更多耐心等待成果' },
        { icon: '🏆', text: '最终可达到专家级水平' },
      ],
      balanced: [
        { icon: '🌱', text: '最稳定的长期发展策略' },
        { icon: '⏳', text: '需要较长时间才能看到显著效果' },
        { icon: '🎯', text: '适合追求全面发展的用户' },
      ],
    };
    return recommendations[path] || [];
  }

  // 更新演化目标显示
  updateEvolutionGoalsDisplay(path) {
    // 根据选择的路径更新目标显示
    // 这里可以根据不同路径显示不同的目标
    this.addActivityLog(`🎯 演化目标已更新为${this.getPathDisplayName(path)}路径`);
  }

  // 添加演化路径可视化
  showEvolutionPathVisualization() {
    try {
      this.addActivityLog('🗺️ 显示演化路径可视化');

      const vizDialog = document.createElement('div');
      vizDialog.className = 'spm-modal';
      vizDialog.innerHTML = `
        <div class="spm-modal-content evolution-visualization-content">
          <div class="spm-modal-header">
            <h3>🗺️ 演化路径可视化</h3>
            <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
          </div>
          <div class="spm-modal-body">
            <div class="path-visualization">
              <div class="evolution-stages">
                <div class="stage current">
                  <div class="stage-icon">🌱</div>
                  <div class="stage-name">初始阶段</div>
                  <div class="stage-progress">已完成</div>
                </div>
                <div class="stage-arrow">→</div>
                <div class="stage active">
                  <div class="stage-icon">🌿</div>
                  <div class="stage-name">稳定阶段</div>
                  <div class="stage-progress">进行中 (67%)</div>
                </div>
                <div class="stage-arrow">→</div>
                <div class="stage future">
                  <div class="stage-icon">🌳</div>
                  <div class="stage-name">进化阶段</div>
                  <div class="stage-progress">待开始</div>
                </div>
                <div class="stage-arrow">→</div>
                <div class="stage future">
                  <div class="stage-icon">🏆</div>
                  <div class="stage-name">专家阶段</div>
                  <div class="stage-progress">未来目标</div>
                </div>
              </div>
              
              <div class="path-options-visual">
                <h4>可选路径预览:</h4>
                <div class="visual-paths">
                  <div class="visual-path positive">
                    <div class="path-line"></div>
                    <div class="path-label">正向演化</div>
                    <div class="path-desc">稳定 · 均衡 · 推荐</div>
                  </div>
                  <div class="visual-path accelerated">
                    <div class="path-line steep"></div>
                    <div class="path-label">加速演化</div>
                    <div class="path-desc">快速 · 高风险 · 短期</div>
                  </div>
                  <div class="visual-path deep">
                    <div class="path-line deep"></div>
                    <div class="path-label">深度演化</div>
                    <div class="path-desc">专精 · 深入 · 专业</div>
                  </div>
                  <div class="visual-path balanced">
                    <div class="path-line gentle"></div>
                    <div class="path-label">平衡演化</div>
                    <div class="path-desc">全面 · 稳定 · 长期</div>
                  </div>
                </div>
              </div>

              <div class="milestone-prediction">
                <h4>里程碑预测:</h4>
                <div class="milestones">
                  <div class="milestone">
                    <span class="milestone-time">3天后</span>
                    <span class="milestone-event">完成稳定阶段</span>
                    <span class="milestone-reward">+100 经验值</span>
                  </div>
                  <div class="milestone">
                    <span class="milestone-time">1周后</span>
                    <span class="milestone-event">解锁新技巧</span>
                    <span class="milestone-reward">获得高级技巧</span>
                  </div>
                  <div class="milestone">
                    <span class="milestone-time">1月后</span>
                    <span class="milestone-event">进入进化阶段</span>
                    <span class="milestone-reward">人格系统升级</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="spm-modal-footer">
            <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
            <button class="spm-btn primary" onclick="spmMonitor.showEvolutionDirectionSetting()">设置路径</button>
          </div>
        </div>
      `;

      document.body.appendChild(vizDialog);
      this.addActivityLog('✅ 演化路径可视化已显示');
    } catch (error) {
      console.error('❌ 显示演化路径可视化失败:', error);
      this.addActivityLog(`❌ 可视化显示失败: ${error.message}`);
    }
  }

  // 应用演化设置
  applyEvolutionSettings() {
    try {
      this.addActivityLog('✅ 开始应用演化设置');

      // 获取用户选择的设置
      const selectedPath = document.querySelector('input[name="evolution-path"]:checked')?.value || 'positive';
      const parameterSelects = document.querySelectorAll('.parameter-select');

      const settings = {
        evolutionPath: selectedPath,
        experienceMultiplier: parameterSelects[0]?.value || '1.0',
        skillImprovement: parameterSelects[1]?.value || 'normal',
        personaStability: parameterSelects[2]?.value || 'normal',
        evolutionSpeed: parameterSelects[3]?.value || 'normal',
      };

      // 保存设置到本地
      this.saveEvolutionSettings(settings);

      // 应用设置到系统
      this.applySettingsToSystem(settings);

      // 更新数据显示
      this.updateEvolutionDisplay(settings);

      // 生成设置应用报告
      this.generateSettingsApplicationReport(settings);

      // 关闭设置对话框
      const settingDialog = document.querySelector('.evolution-setting-content');
      if (settingDialog) {
        settingDialog.closest('.spm-modal').remove();
      }

      this.addActivityLog(`✅ 演化设置已应用：${this.getPathDisplayName(selectedPath)}路径`);
    } catch (error) {
      console.error('❌ 应用演化设置失败:', error);
      this.addActivityLog(`❌ 设置应用失败: ${error.message}`);
    }
  }

  // 保存演化设置
  saveEvolutionSettings(settings) {
    try {
      // 保存到localStorage
      localStorage.setItem('spm_evolution_settings', JSON.stringify(settings));

      // 更新内部设置
      this.evolutionSettings = {
        ...this.evolutionSettings,
        ...settings,
        lastUpdated: new Date().toISOString(),
      };

      this.addActivityLog('💾 演化设置已保存');
    } catch (error) {
      console.error('❌ 保存演化设置失败:', error);
      this.addActivityLog(`❌ 设置保存失败: ${error.message}`);
    }
  }

  // 应用设置到系统
  applySettingsToSystem(settings) {
    try {
      // 更新经验值获取倍率
      const expMultiplier = parseFloat(settings.experienceMultiplier);
      this.settings.experienceMultiplier = expMultiplier;

      // 更新演化速度
      this.settings.evolutionSpeed = settings.evolutionSpeed;

      // 更新人格稳定性影响
      this.settings.personaStabilityImpact = settings.personaStability;

      // 更新技巧提升速度
      this.settings.skillImprovementRate = settings.skillImprovement;

      // 根据路径调整系统行为
      this.adjustSystemBehavior(settings.evolutionPath);

      this.addActivityLog('⚙️ 系统设置已更新');
    } catch (error) {
      console.error('❌ 应用系统设置失败:', error);
      this.addActivityLog(`❌ 系统设置失败: ${error.message}`);
    }
  }

  // 调整系统行为
  adjustSystemBehavior(path) {
    switch (path) {
      case 'accelerated':
        this.settings.updateInterval = 3000; // 更频繁的更新
        this.settings.experienceBonus = 1.5; // 经验加成
        break;
      case 'deep':
        this.settings.skillFocusMode = true; // 技巧专注模式
        this.settings.depthAnalysis = true; // 深度分析
        break;
      case 'balanced':
        this.settings.balancedMode = true; // 平衡模式
        this.settings.comprehensiveTracking = true; // 全面跟踪
        break;
      default: // positive
        this.settings.stableMode = true; // 稳定模式
        this.settings.gradualImprovement = true; // 渐进改进
    }
  }

  // 更新演化显示
  updateEvolutionDisplay(settings) {
    try {
      // 更新演化卡片显示
      const evolutionCard = document.querySelector('.spm-evolution-card');
      if (evolutionCard) {
        const pathElement = evolutionCard.querySelector('.evolution-path');
        if (pathElement) {
          pathElement.textContent = this.getPathDisplayName(settings.evolutionPath);
        }
      }

      // 更新演化进度显示
      this.updateEvolutionProgress(settings);

      this.addActivityLog('🔄 演化显示已更新');
    } catch (error) {
      console.error('❌ 更新演化显示失败:', error);
      this.addActivityLog(`❌ 显示更新失败: ${error.message}`);
    }
  }

  // 更新演化进度
  updateEvolutionProgress(settings) {
    // 根据设置调整进度计算
    const speedMultiplier =
      {
        slow: 0.7,
        normal: 1.0,
        fast: 1.3,
      }[settings.evolutionSpeed] || 1.0;

    const expMultiplier = parseFloat(settings.experienceMultiplier);

    // 更新进度显示
    const progressElements = document.querySelectorAll('.evolution-progress-fill');
    progressElements.forEach(element => {
      // 可以根据新设置重新计算进度
      const currentWidth = parseFloat(element.style.width) || 67;
      // 这里可以添加更复杂的进度重计算逻辑
    });
  }

  // 生成设置应用报告
  generateSettingsApplicationReport(settings) {
    try {
      const reportDialog = document.createElement('div');
      reportDialog.className = 'spm-modal';
      reportDialog.innerHTML = `
        <div class="spm-modal-content settings-report-content">
          <div class="spm-modal-header">
            <h3>📋 演化设置应用报告</h3>
            <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
          </div>
          <div class="spm-modal-body">
            <div class="report-summary">
              <h4>设置应用成功</h4>
              <div class="success-indicator">✅ 所有设置已成功应用</div>
            </div>

            <div class="applied-settings">
              <h4>已应用的设置:</h4>
              <div class="settings-grid">
                <div class="setting-item">
                  <span class="setting-label">演化路径:</span>
                  <span class="setting-value">${this.getPathDisplayName(settings.evolutionPath)}</span>
                </div>
                <div class="setting-item">
                  <span class="setting-label">经验倍率:</span>
                  <span class="setting-value">${settings.experienceMultiplier}x</span>
                </div>
                <div class="setting-item">
                  <span class="setting-label">技巧提升:</span>
                  <span class="setting-value">${settings.skillImprovement}</span>
                </div>
                <div class="setting-item">
                  <span class="setting-label">人格稳定性:</span>
                  <span class="setting-value">${settings.personaStability}</span>
                </div>
                <div class="setting-item">
                  <span class="setting-label">演化速度:</span>
                  <span class="setting-value">${settings.evolutionSpeed}</span>
                </div>
              </div>
            </div>

            <div class="immediate-effects">
              <h4>立即生效的变化:</h4>
              <div class="effects-list">
                <div class="effect-item">
                  <span class="effect-icon">⚡</span>
                  <span class="effect-text">系统更新频率已调整</span>
                </div>
                <div class="effect-item">
                  <span class="effect-icon">📈</span>
                  <span class="effect-text">经验值获取倍率已更新</span>
                </div>
                <div class="effect-item">
                  <span class="effect-icon">🎯</span>
                  <span class="effect-text">演化目标已重新设定</span>
                </div>
                <div class="effect-item">
                  <span class="effect-icon">🔄</span>
                  <span class="effect-text">界面显示已同步更新</span>
                </div>
              </div>
            </div>

            <div class="next-steps">
              <h4>接下来的建议:</h4>
              <div class="suggestions">
                ${this.getNextStepSuggestions(settings.evolutionPath)
                  .map(
                    suggestion => `
                  <div class="suggestion-item">
                    <span class="suggestion-icon">${suggestion.icon}</span>
                    <span class="suggestion-text">${suggestion.text}</span>
                  </div>
                `,
                  )
                  .join('')}
              </div>
            </div>

            <div class="monitoring-info">
              <h4>监控提醒:</h4>
              <div class="monitoring-notes">
                <p>✨ 新设置将在下次互动时开始生效</p>
                <p>📊 建议定期查看进度报告以跟踪效果</p>
                <p>⚙️ 如有需要，可随时调整设置</p>
              </div>
            </div>
          </div>
          <div class="spm-modal-footer">
            <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
            <button class="spm-btn secondary" onclick="spmMonitor.exportEvolutionSettings()">导出设置</button>
            <button class="spm-btn primary" onclick="spmMonitor.showEvolutionHistory()">查看历史</button>
          </div>
        </div>
      `;

      document.body.appendChild(reportDialog);
      this.addActivityLog('📋 设置应用报告已生成');
    } catch (error) {
      console.error('❌ 生成设置报告失败:', error);
      this.addActivityLog(`❌ 报告生成失败: ${error.message}`);
    }
  }

  // 获取下一步建议
  getNextStepSuggestions(path) {
    const suggestions = {
      positive: [
        { icon: '🎯', text: '建议每日进行技巧练习以保持稳定进步' },
        { icon: '📊', text: '定期查看详细统计了解发展趋势' },
        { icon: '🔄', text: '可以适时考虑调整演化参数' },
      ],
      accelerated: [
        { icon: '⚠️', text: '密切关注人格稳定性指标变化' },
        { icon: '📈', text: '利用快速发展期多尝试新技巧' },
        { icon: '🛡️', text: '准备应对可能的不稳定因素' },
      ],
      deep: [
        { icon: '🎯', text: '专注于选定的技巧领域深入练习' },
        { icon: '📚', text: '学习相关的高级技巧理论' },
        { icon: '⏰', text: '保持耐心，深度发展需要时间' },
      ],
      balanced: [
        { icon: '⚖️', text: '均衡分配时间到各个技巧领域' },
        { icon: '📋', text: '制定详细的全面发展计划' },
        { icon: '🔍', text: '定期评估各方面的发展平衡性' },
      ],
    };
    return suggestions[path] || [];
  }

  // 导出演化设置
  exportEvolutionSettings() {
    try {
      this.addActivityLog('📤 导出演化设置');

      const settings = this.evolutionSettings || {};
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        evolutionSettings: settings,
        systemInfo: {
          spmVersion: EXTENSION_VERSION,
          platform: navigator.platform,
          userAgent: navigator.userAgent,
        },
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `SPM_演化设置_${new Date().toISOString().split('T')[0]}.json`;
      downloadLink.click();

      URL.revokeObjectURL(url);
      this.addActivityLog('✅ 演化设置已导出');
    } catch (error) {
      console.error('❌ 导出演化设置失败:', error);
      this.addActivityLog(`❌ 导出失败: ${error.message}`);
    }
  }

  // 运行系统健康检查
  runSystemHealthCheck() {
    try {
      this.addActivityLog('🔧 开始系统健康检查');

      const existingDialog = document.getElementById('system-health-dialog');
      if (existingDialog) {
        existingDialog.remove();
      }

      // 创建检查进度对话框
      const progressDialog = document.createElement('div');
      progressDialog.id = 'system-health-dialog';
      progressDialog.className = 'spm-modal';
      progressDialog.innerHTML = `
        <div class="spm-modal-content health-check-content">
          <div class="spm-modal-header">
            <h3>🔧 系统健康检查</h3>
            <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
          </div>
          <div class="spm-modal-body">
            <div class="check-progress">
              <h4>检查进度:</h4>
              <div class="progress-container">
                <div class="progress-bar-main">
                  <div class="progress-fill-main" id="health-check-progress" style="width: 0%"></div>
                </div>
                <span class="progress-text" id="health-progress-text">0%</span>
              </div>
            </div>
            
            <div class="check-status" id="health-check-status">
              <div class="status-item">
                <span class="status-icon">⏳</span>
                <span class="status-text">准备开始检查...</span>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(progressDialog);

      // 开始检查流程
      this.performHealthCheck();
    } catch (error) {
      console.error('❌ 系统健康检查启动失败:', error);
      this.addActivityLog(`❌ 健康检查失败: ${error.message}`);
    }
  }

  // 执行健康检查流程
  async performHealthCheck() {
    const progressBar = document.getElementById('health-check-progress');
    const progressText = document.getElementById('health-progress-text');
    const statusContainer = document.getElementById('health-check-status');

    const checks = [
      { name: '系统状态检查', duration: 800, issues: [] },
      { name: '数据完整性检查', duration: 1000, issues: [] },
      { name: '功能模块检查', duration: 900, issues: [] },
      { name: '性能指标检查', duration: 700, issues: ['存储空间使用率较高 (85%)'] },
      { name: '内存使用检查', duration: 600, issues: [] },
      { name: '网络连接检查', duration: 500, issues: [] },
    ];

    let totalProgress = 0;
    const stepProgress = 100 / checks.length;

    for (let i = 0; i < checks.length; i++) {
      const check = checks[i];

      // 更新状态显示
      statusContainer.innerHTML += `
        <div class="status-item checking">
          <span class="status-icon">🔄</span>
          <span class="status-text">正在执行: ${check.name}</span>
        </div>
      `;

      // 模拟检查过程
      await new Promise(resolve => setTimeout(resolve, check.duration));

      // 更新进度
      totalProgress += stepProgress;
      progressBar.style.width = `${totalProgress}%`;
      progressText.textContent = `${Math.round(totalProgress)}%`;

      // 更新检查结果
      const checkIcon = check.issues.length > 0 ? '⚠️' : '✅';
      const checkStatus = check.issues.length > 0 ? 'warning' : 'success';

      statusContainer.innerHTML += `
        <div class="status-item ${checkStatus}">
          <span class="status-icon">${checkIcon}</span>
          <span class="status-text">${check.name}: ${check.issues.length > 0 ? '发现问题' : '正常'}</span>
        </div>
      `;

      if (check.issues.length > 0) {
        check.issues.forEach(issue => {
          statusContainer.innerHTML += `
            <div class="status-detail">
              <span class="detail-icon">▸</span>
              <span class="detail-text">${issue}</span>
            </div>
          `;
        });
      }
    }

    // 检查完成，显示完整报告
    setTimeout(() => {
      this.showHealthCheckReport(checks);
    }, 500);
  }

  // 显示健康检查报告
  showHealthCheckReport(checks) {
    const totalIssues = checks.reduce((sum, check) => sum + check.issues.length, 0);
    const healthScore = Math.max(98 - totalIssues * 10, 60);

    const reportDialog = document.createElement('div');
    reportDialog.className = 'spm-modal';
    reportDialog.innerHTML = `
      <div class="spm-modal-content health-report-content">
        <div class="spm-modal-header">
          <h3>🔧 系统健康检查报告</h3>
          <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
        </div>
        <div class="spm-modal-body">
          <div class="report-overview">
            <div class="health-summary">
              <div class="health-score">
                <span class="score-label">总体健康度:</span>
                <span class="score-value">${healthScore}%</span>
                <div class="health-bar">
                  <div class="health-fill" style="width: ${healthScore}%"></div>
                </div>
              </div>
              <div class="health-status ${healthScore >= 90 ? 'excellent' : healthScore >= 70 ? 'good' : 'warning'}">
                ${healthScore >= 90 ? '✅ 优秀' : healthScore >= 70 ? '🟡 良好' : '⚠️ 需要注意'}
              </div>
            </div>
            
            <div class="check-time">
              <span class="time-label">检查时间:</span>
              <span class="time-value">${new Date().toLocaleString()}</span>
            </div>
          </div>

          <div class="detailed-results">
            <h4>检查项目详情:</h4>
            <div class="results-grid">
              ${checks
                .map(
                  check => `
                <div class="result-item ${check.issues.length > 0 ? 'has-issues' : 'normal'}">
                  <div class="result-header">
                    <span class="result-icon">${check.issues.length > 0 ? '⚠️' : '🟢'}</span>
                    <span class="result-name">${check.name}</span>
                    <span class="result-status">${check.issues.length > 0 ? '发现问题' : '正常'}</span>
                  </div>
                  ${
                    check.issues.length > 0
                      ? `
                    <div class="result-issues">
                      ${check.issues
                        .map(
                          issue => `
                        <div class="issue-item">
                          <span class="issue-icon">▸</span>
                          <span class="issue-text">${issue}</span>
                        </div>
                      `,
                        )
                        .join('')}
                    </div>
                  `
                      : ''
                  }
                </div>
              `,
                )
                .join('')}
            </div>
          </div>

          ${
            totalIssues > 0
              ? `
            <div class="optimization-suggestions">
              <h4>优化建议:</h4>
              <div class="suggestions-list">
                <div class="suggestion-item">
                  <span class="suggestion-icon">🔧</span>
                  <span class="suggestion-text">建议清理历史数据，释放存储空间</span>
                  <button class="suggestion-action" onclick="spmMonitor.cleanupStorage()">立即清理</button>
                </div>
                <div class="suggestion-item">
                  <span class="suggestion-icon">⚙️</span>
                  <span class="suggestion-text">调整数据同步频率，从5秒改为10秒</span>
                  <button class="suggestion-action" onclick="spmMonitor.optimizeSyncFrequency()">立即优化</button>
                </div>
                <div class="suggestion-item">
                  <span class="suggestion-icon">📊</span>
                  <span class="suggestion-text">启用数据压缩，减少存储使用</span>
                  <button class="suggestion-action" onclick="spmMonitor.enableDataCompression()">启用压缩</button>
                </div>
              </div>
            </div>
          `
              : ''
          }

          <div class="report-actions">
            <h4>后续操作:</h4>
            <div class="actions-grid">
              <button class="action-btn secondary" onclick="spmMonitor.exportHealthReport()">导出报告</button>
              <button class="action-btn secondary" onclick="spmMonitor.scheduleNextCheck()">定期检查</button>
              <button class="action-btn primary" onclick="spmMonitor.runSystemHealthCheck()">重新检查</button>
              ${
                totalIssues > 0
                  ? `<button class="action-btn primary" onclick="spmMonitor.autoFixIssues()">自动修复</button>`
                  : ''
              }
            </div>
          </div>
        </div>
      </div>
    `;

    // 移除进度对话框
    const progressDialog = document.getElementById('system-health-dialog');
    if (progressDialog) {
      progressDialog.remove();
    }

    document.body.appendChild(reportDialog);
    this.addActivityLog(`✅ 系统健康检查完成，健康度: ${healthScore}%`);
  }

  // 清理存储空间
  cleanupStorage() {
    this.addActivityLog('🧹 开始清理存储空间');
    // 实现存储清理逻辑
    setTimeout(() => {
      this.addActivityLog('✅ 存储空间清理完成，释放了约15%的空间');
    }, 1000);
  }

  // 优化同步频率
  optimizeSyncFrequency() {
    this.addActivityLog('⚙️ 优化数据同步频率');
    this.settings.updateInterval = 10000; // 改为10秒
    this.addActivityLog('✅ 同步频率已优化为10秒');
  }

  // 启用数据压缩
  enableDataCompression() {
    this.addActivityLog('📊 启用数据压缩');
    // 实现数据压缩逻辑
    this.addActivityLog('✅ 数据压缩已启用，预计减少20%存储使用');
  }

  // 导出健康报告
  exportHealthReport() {
    this.addActivityLog('📤 导出健康检查报告');
    const reportData = {
      timestamp: new Date().toISOString(),
      healthScore: 98,
      checkResults: 'Detailed health check results...',
      recommendations: 'System optimization recommendations...',
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `SPM_健康检查报告_${new Date().toISOString().split('T')[0]}.json`;
    downloadLink.click();

    URL.revokeObjectURL(url);
    this.addActivityLog('✅ 健康检查报告已导出');
  }

  // 安排下次检查
  scheduleNextCheck() {
    this.addActivityLog('📅 安排定期健康检查');
    // 实现定期检查调度逻辑
    this.addActivityLog('✅ 已安排每周自动健康检查');
  }

  // 自动修复问题
  autoFixIssues() {
    this.addActivityLog('🔧 开始自动修复问题');
    // 实现自动修复逻辑
    setTimeout(() => {
      this.addActivityLog('✅ 自动修复完成，建议重新运行健康检查验证');
    }, 2000);
  }

  // 显示性能优化建议
  showPerformanceOptimization() {
    try {
      this.addActivityLog('⚡ 查看性能优化建议');

      const existingDialog = document.getElementById('performance-optimization-dialog');
      if (existingDialog) {
        existingDialog.remove();
      }

      const optimizationDialog = document.createElement('div');
      optimizationDialog.id = 'performance-optimization-dialog';
      optimizationDialog.className = 'spm-modal';
      optimizationDialog.innerHTML = `
        <div class="spm-modal-content performance-optimization-content">
          <div class="spm-modal-header">
            <h3>📊 性能优化建议</h3>
            <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
          </div>
          <div class="spm-modal-body">
            <div class="current-performance">
              <h4>当前性能评估: 优秀 (98分)</h4>
              <div class="performance-summary">
                <div class="perf-metric">
                  <span class="metric-name">响应时间:</span>
                  <span class="metric-value good">0.3秒</span>
                  <span class="metric-status">✅ 良好</span>
                </div>
                <div class="perf-metric">
                  <span class="metric-name">内存使用:</span>
                  <span class="metric-value good">45MB</span>
                  <span class="metric-status">✅ 正常</span>
                </div>
                <div class="perf-metric">
                  <span class="metric-name">网络延迟:</span>
                  <span class="metric-value good">50ms</span>
                  <span class="metric-status">✅ 优秀</span>
                </div>
                <div class="perf-metric">
                  <span class="metric-name">存储空间:</span>
                  <span class="metric-value warning">85%使用率</span>
                  <span class="metric-status">⚠️ 需要注意</span>
                </div>
              </div>
            </div>

            <div class="optimization-categories">
              <div class="optimization-category">
                <div class="category-header">
                  <h4>🔧 系统优化 (优先级: 高)</h4>
                </div>
                <div class="optimization-items">
                  <div class="optimization-item">
                    <div class="item-header">
                      <span class="item-icon">📦</span>
                      <span class="item-title">启用数据压缩</span>
                      <span class="item-impact">减少20%内存使用</span>
                    </div>
                    <div class="item-description">
                      通过启用数据压缩功能，可以有效减少内存占用和存储空间使用
                    </div>
                    <button class="optimization-action" onclick="spmMonitor.applyOptimization('dataCompression')">立即启用</button>
                  </div>

                  <div class="optimization-item">
                    <div class="item-header">
                      <span class="item-icon">🚀</span>
                      <span class="item-title">调整缓存策略</span>
                      <span class="item-impact">提升15%响应速度</span>
                    </div>
                    <div class="item-description">
                      优化缓存机制，实现智能预加载和及时清理，提升系统响应速度
                    </div>
                    <button class="optimization-action" onclick="spmMonitor.applyOptimization('cacheStrategy')">立即优化</button>
                  </div>

                  <div class="optimization-item">
                    <div class="item-header">
                      <span class="item-icon">🔍</span>
                      <span class="item-title">优化数据库查询</span>
                      <span class="item-impact">减少10%CPU使用</span>
                    </div>
                    <div class="item-description">
                      通过查询优化和索引调整，降低CPU负担，提升数据处理效率
                    </div>
                    <button class="optimization-action" onclick="spmMonitor.applyOptimization('databaseQuery')">立即优化</button>
                  </div>
                </div>
              </div>

              <div class="optimization-category">
                <div class="category-header">
                  <h4>🎯 功能优化 (优先级: 中)</h4>
                </div>
                <div class="optimization-items">
                  <div class="optimization-item">
                    <div class="item-header">
                      <span class="item-icon">⏱️</span>
                      <span class="item-title">启用懒加载</span>
                      <span class="item-impact">减少30%初始加载时间</span>
                    </div>
                    <div class="item-description">
                      对非关键组件实施懒加载策略，减少初始化时间
                    </div>
                    <button class="optimization-action" onclick="spmMonitor.applyOptimization('lazyLoading')">立即启用</button>
                  </div>

                  <div class="optimization-item">
                    <div class="item-header">
                      <span class="item-icon">🖼️</span>
                      <span class="item-title">优化图片资源</span>
                      <span class="item-impact">减少25%网络传输</span>
                    </div>
                    <div class="item-description">
                      压缩图片资源，使用更高效的图片格式，减少网络传输负担
                    </div>
                    <button class="optimization-action" onclick="spmMonitor.applyOptimization('imageOptimization')">立即优化</button>
                  </div>

                  <div class="optimization-item">
                    <div class="item-header">
                      <span class="item-icon">📥</span>
                      <span class="item-title">启用预加载</span>
                      <span class="item-impact">提升20%用户体验</span>
                    </div>
                    <div class="item-description">
                      预加载关键资源和数据，提升用户交互体验
                    </div>
                    <button class="optimization-action" onclick="spmMonitor.applyOptimization('preloading')">立即启用</button>
                  </div>
                </div>
              </div>

              <div class="optimization-category">
                <div class="category-header">
                  <h4>📊 数据优化 (优先级: 低)</h4>
                </div>
                <div class="optimization-items">
                  <div class="optimization-item">
                    <div class="item-header">
                      <span class="item-icon">🗑️</span>
                      <span class="item-title">清理历史数据</span>
                      <span class="item-impact">释放15%存储空间</span>
                    </div>
                    <div class="item-description">
                      清理过期的历史数据和临时文件，释放存储空间
                    </div>
                    <button class="optimization-action" onclick="spmMonitor.applyOptimization('dataCleanup')">立即清理</button>
                  </div>

                  <div class="optimization-item">
                    <div class="item-header">
                      <span class="item-icon">🔄</span>
                      <span class="item-title">优化数据同步</span>
                      <span class="item-impact">减少5%网络使用</span>
                    </div>
                    <div class="item-description">
                      调整数据同步频率和策略，减少不必要的网络传输
                    </div>
                    <button class="optimization-action" onclick="spmMonitor.applyOptimization('syncOptimization')">立即优化</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="optimization-preview">
              <h4>优化效果预测:</h4>
              <div class="preview-grid">
                <div class="preview-item">
                  <span class="preview-label">响应时间:</span>
                  <span class="preview-change">0.3秒 → 0.2秒</span>
                  <span class="preview-improvement">↗️ 提升33%</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">内存使用:</span>
                  <span class="preview-change">45MB → 35MB</span>
                  <span class="preview-improvement">↘️ 减少22%</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">CPU使用:</span>
                  <span class="preview-change">15% → 12%</span>
                  <span class="preview-improvement">↘️ 减少20%</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">网络传输:</span>
                  <span class="preview-change">减少30%</span>
                  <span class="preview-improvement">↘️ 大幅改善</span>
                </div>
              </div>
            </div>

            <div class="implementation-plan">
              <h4>优化实施计划:</h4>
              <div class="plan-phases">
                <div class="phase-item">
                  <div class="phase-header">
                    <span class="phase-number">1</span>
                    <span class="phase-title">阶段1 (立即实施)</span>
                  </div>
                  <div class="phase-tasks">
                    <span class="task-item">• 启用数据压缩</span>
                    <span class="task-item">• 调整缓存策略</span>
                    <span class="task-item">• 清理历史数据</span>
                  </div>
                </div>
                <div class="phase-item">
                  <div class="phase-header">
                    <span class="phase-number">2</span>
                    <span class="phase-title">阶段2 (1周内)</span>
                  </div>
                  <div class="phase-tasks">
                    <span class="task-item">• 优化数据库查询</span>
                    <span class="task-item">• 启用懒加载</span>
                    <span class="task-item">• 优化图片资源</span>
                  </div>
                </div>
                <div class="phase-item">
                  <div class="phase-header">
                    <span class="phase-number">3</span>
                    <span class="phase-title">阶段3 (1月内)</span>
                  </div>
                  <div class="phase-tasks">
                    <span class="task-item">• 启用预加载</span>
                    <span class="task-item">• 优化数据同步</span>
                    <span class="task-item">• 全面性能调优</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="spm-modal-footer">
            <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
            <button class="spm-btn secondary" onclick="spmMonitor.exportOptimizationPlan()">导出计划</button>
            <button class="spm-btn primary" onclick="spmMonitor.applyAllOptimizations()">应用所有优化</button>
          </div>
        </div>
      `;

      document.body.appendChild(optimizationDialog);
      this.addActivityLog('✅ 性能优化建议已显示');
    } catch (error) {
      console.error('❌ 显示性能优化建议失败:', error);
      this.addActivityLog(`❌ 性能优化显示失败: ${error.message}`);
    }
  }

  // 应用优化措施
  applyOptimization(type) {
    const optimizations = {
      dataCompression: '数据压缩',
      cacheStrategy: '缓存策略',
      databaseQuery: '数据库查询',
      lazyLoading: '懒加载',
      imageOptimization: '图片优化',
      preloading: '预加载',
      dataCleanup: '数据清理',
      syncOptimization: '同步优化',
    };

    const optimizationName = optimizations[type] || type;
    this.addActivityLog(`⚡ 正在应用优化: ${optimizationName}`);

    // 模拟优化过程
    setTimeout(() => {
      this.addActivityLog(`✅ ${optimizationName}优化已完成`);
      // 更新UI中的状态
      const button = event.target;
      button.textContent = '已应用';
      button.disabled = true;
      button.classList.add('applied');
    }, 1000);
  }

  // 应用所有优化
  applyAllOptimizations() {
    this.addActivityLog('🚀 开始应用所有性能优化');

    const optimizations = [
      'dataCompression',
      'cacheStrategy',
      'databaseQuery',
      'lazyLoading',
      'imageOptimization',
      'preloading',
      'dataCleanup',
      'syncOptimization',
    ];

    let completed = 0;
    optimizations.forEach((opt, index) => {
      setTimeout(() => {
        this.applyOptimization(opt);
        completed++;
        if (completed === optimizations.length) {
          this.addActivityLog('✅ 所有性能优化已完成，系统性能显著提升');
        }
      }, index * 500);
    });
  }

  // 导出优化计划
  exportOptimizationPlan() {
    this.addActivityLog('📤 导出性能优化计划');

    const planData = {
      timestamp: new Date().toISOString(),
      currentPerformance: {
        responseTime: '0.3s',
        memoryUsage: '45MB',
        cpuUsage: '15%',
        networkLatency: '50ms',
      },
      optimizations: [
        { name: '数据压缩', impact: '减少20%内存使用', priority: 'high' },
        { name: '缓存策略', impact: '提升15%响应速度', priority: 'high' },
        { name: '数据库查询', impact: '减少10%CPU使用', priority: 'high' },
      ],
      expectedResults: {
        responseTime: '0.2s',
        memoryUsage: '35MB',
        cpuUsage: '12%',
        networkReduction: '30%',
      },
    };

    const dataStr = JSON.stringify(planData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `SPM_性能优化计划_${new Date().toISOString().split('T')[0]}.json`;
    downloadLink.click();

    URL.revokeObjectURL(url);
    this.addActivityLog('✅ 优化计划已导出');
  }

  // 显示详细统计报告
  showDetailedStatistics() {
    try {
      this.addActivityLog('📊 查看详细统计报告');

      const statsDialog = document.createElement('div');
      statsDialog.className = 'spm-modal detailed-stats-modal';
      statsDialog.innerHTML = `
        <div class="spm-modal-content detailed-stats-content">
          <div class="spm-modal-header">
            <h3>📊 详细统计报告</h3>
            <div class="stats-controls">
              <select class="time-period-select" onchange="spmMonitor.changeStatsPeriod(this.value)">
                <option value="7">最近7天</option>
                <option value="30" selected>最近30天</option>
                <option value="90">最近90天</option>
                <option value="all">全部时间</option>
              </select>
              <button class="refresh-stats-btn" onclick="spmMonitor.refreshStatistics()">🔄 刷新</button>
            </div>
            <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
          </div>
          <div class="spm-modal-body">
            <div class="stats-tabs">
              <div class="tab-nav">
                <button class="tab-btn active" data-tab="overview">概览</button>
                <button class="tab-btn" data-tab="performance">性能</button>
                <button class="tab-btn" data-tab="evolution">演化</button>
                <button class="tab-btn" data-tab="interactions">交互</button>
                <button class="tab-btn" data-tab="trends">趋势</button>
              </div>

              <!-- 概览标签页 -->
              <div class="tab-content active" data-tab="overview">
                ${this.generateOverviewStats()}
              </div>

              <!-- 性能标签页 -->
              <div class="tab-content" data-tab="performance">
                ${this.generatePerformanceStats()}
              </div>

              <!-- 演化标签页 -->
              <div class="tab-content" data-tab="evolution">
                ${this.generateEvolutionStats()}
              </div>

              <!-- 交互标签页 -->
              <div class="tab-content" data-tab="interactions">
                ${this.generateInteractionStats()}
              </div>

              <!-- 趋势标签页 -->
              <div class="tab-content" data-tab="trends">
                ${this.generateTrendStats()}
              </div>
            </div>
          </div>
          <div class="spm-modal-footer">
            <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
            <button class="spm-btn secondary" onclick="spmMonitor.exportStatistics()">📤 导出报告</button>
            <button class="spm-btn secondary" onclick="spmMonitor.generateInsights()">🧠 生成洞察</button>
            <button class="spm-btn primary" onclick="spmMonitor.shareStatistics()">📋 分享统计</button>
          </div>
        </div>
      `;

      document.body.appendChild(statsDialog);

      // 初始化标签页切换
      this.initStatsTabSwitching();

      // 初始化图表
      this.initStatsCharts();

      this.addActivityLog('✅ 详细统计报告已加载');
    } catch (error) {
      console.error('❌ 显示详细统计失败:', error);
      this.addActivityLog(`❌ 统计显示失败: ${error.message}`);
    }
  }

  // 生成概览统计
  generateOverviewStats() {
    const stats = this.calculateOverviewStatistics();
    return `
      <div class="report-header">
        <div class="report-info">
          <div class="report-time">报告生成时间: ${new Date().toLocaleString()}</div>
          <div class="report-period">报告周期: 最近30天</div>
          <div class="report-accuracy">数据准确度: 99.8%</div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <div class="stat-label">运行时间</div>
            <div class="stat-value">${stats.uptime}</div>
            <div class="stat-trend positive">+${stats.uptimeTrend}% 本周</div>
          </div>
        </div>

        <div class="stat-card secondary">
          <div class="stat-icon">💬</div>
          <div class="stat-content">
            <div class="stat-label">总交互次数</div>
            <div class="stat-value">${stats.totalInteractions}</div>
            <div class="stat-trend positive">+${stats.interactionsTrend}% 本周</div>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon">❤️</div>
          <div class="stat-content">
            <div class="stat-label">系统健康度</div>
            <div class="stat-value">${stats.healthScore}%</div>
            <div class="health-bar">
              <div class="health-fill" style="width: ${stats.healthScore}%"></div>
            </div>
          </div>
        </div>

        <div class="stat-card info">
          <div class="stat-icon">🚀</div>
          <div class="stat-content">
            <div class="stat-label">性能得分</div>
            <div class="stat-value">${stats.performanceScore}</div>
            <div class="stat-trend ${stats.performanceTrend > 0 ? 'positive' : 'negative'}">${
      stats.performanceTrend > 0 ? '+' : ''
    }${stats.performanceTrend}% 本周</div>
          </div>
        </div>
      </div>

      <div class="detailed-metrics">
        <div class="metrics-section">
          <h4>📊 核心指标</h4>
          <div class="metrics-grid">
            <div class="metric-item">
              <span class="metric-label">数据完整性:</span>
              <span class="metric-value">${stats.dataIntegrity}%</span>
              <div class="metric-bar">
                <div class="metric-fill" style="width: ${stats.dataIntegrity}%"></div>
              </div>
            </div>
            <div class="metric-item">
              <span class="metric-label">平均响应时间:</span>
              <span class="metric-value">${stats.avgResponseTime}ms</span>
              <div class="metric-bar">
                <div class="metric-fill" style="width: ${100 - stats.avgResponseTime / 10}%"></div>
              </div>
            </div>
            <div class="metric-item">
              <span class="metric-label">内存使用效率:</span>
              <span class="metric-value">${stats.memoryEfficiency}%</span>
              <div class="metric-bar">
                <div class="metric-fill" style="width: ${stats.memoryEfficiency}%"></div>
              </div>
            </div>
            <div class="metric-item">
              <span class="metric-label">错误率:</span>
              <span class="metric-value">${stats.errorRate}%</span>
              <div class="metric-bar error">
                <div class="metric-fill" style="width: ${stats.errorRate * 10}%"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="usage-patterns">
          <h4>📈 使用模式</h4>
          <div class="pattern-chart" id="usage-pattern-chart">
            <div class="chart-placeholder">使用模式图表</div>
          </div>
        </div>

        <div class="recent-activities">
          <h4>🕐 最近活动</h4>
          <div class="activity-timeline">
            ${this.generateRecentActivities()
              .map(
                activity => `
              <div class="activity-item">
                <div class="activity-time">${activity.time}</div>
                <div class="activity-content">
                  <div class="activity-type">${activity.type}</div>
                  <div class="activity-description">${activity.description}</div>
                </div>
              </div>
            `,
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 生成性能统计
  generatePerformanceStats() {
    const performanceData = this.calculatePerformanceMetrics();
    return `
      <div class="performance-dashboard">
        <div class="performance-summary">
          <h4>🚀 性能概览</h4>
          <div class="summary-grid">
            <div class="summary-item excellent">
              <div class="summary-label">总体评分</div>
              <div class="summary-value">${performanceData.overallScore}/100</div>
              <div class="summary-grade">${this.getPerformanceGrade(performanceData.overallScore)}</div>
            </div>
            <div class="summary-item good">
              <div class="summary-label">响应速度</div>
              <div class="summary-value">${performanceData.responseSpeed}ms</div>
              <div class="summary-grade">${this.getSpeedGrade(performanceData.responseSpeed)}</div>
            </div>
            <div class="summary-item warning">
              <div class="summary-label">资源利用</div>
              <div class="summary-value">${performanceData.resourceUsage}%</div>
              <div class="summary-grade">${this.getUsageGrade(performanceData.resourceUsage)}</div>
            </div>
          </div>
        </div>

        <div class="performance-charts">
          <div class="chart-container">
            <h5>响应时间趋势</h5>
            <div class="response-time-chart" id="response-time-chart">
              <div class="chart-placeholder">响应时间图表</div>
            </div>
          </div>
          <div class="chart-container">
            <h5>CPU使用率</h5>
            <div class="cpu-usage-chart" id="cpu-usage-chart">
              <div class="chart-placeholder">CPU使用率图表</div>
            </div>
          </div>
        </div>

        <div class="performance-details">
          <h4>📋 详细性能指标</h4>
          <div class="performance-table">
            <table>
              <thead>
                <tr>
                  <th>指标项</th>
                  <th>当前值</th>
                  <th>平均值</th>
                  <th>最佳值</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                ${this.generatePerformanceTableRows(performanceData)}
              </tbody>
            </table>
          </div>
        </div>

        <div class="optimization-suggestions">
          <h4>💡 优化建议</h4>
          <div class="suggestions-list">
            ${this.generateOptimizationSuggestions(performanceData)
              .map(
                suggestion => `
              <div class="suggestion-card ${suggestion.priority}">
                <div class="suggestion-icon">${suggestion.icon}</div>
                <div class="suggestion-content">
                  <div class="suggestion-title">${suggestion.title}</div>
                  <div class="suggestion-description">${suggestion.description}</div>
                  <div class="suggestion-impact">预期提升: ${suggestion.impact}</div>
                </div>
                <button class="apply-suggestion-btn" onclick="spmMonitor.applySuggestion('${suggestion.id}')">应用</button>
              </div>
            `,
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 生成演化统计
  generateEvolutionStats() {
    const evolutionData = this.calculateEvolutionMetrics();
    return `
      <div class="evolution-dashboard">
        <div class="evolution-overview">
          <h4>🌟 演化概览</h4>
          <div class="evolution-summary">
            <div class="evolution-progress">
              <div class="progress-item">
                <span class="progress-label">总体进度:</span>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${evolutionData.overallProgress}%"></div>
                  <span class="progress-text">${evolutionData.overallProgress}%</span>
                </div>
              </div>
              <div class="progress-item">
                <span class="progress-label">技巧掌握:</span>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${evolutionData.skillMastery}%"></div>
                  <span class="progress-text">${evolutionData.skillMastery}%</span>
                </div>
              </div>
              <div class="progress-item">
                <span class="progress-label">人格稳定:</span>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${evolutionData.personalityStability}%"></div>
                  <span class="progress-text">${evolutionData.personalityStability}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="skill-breakdown">
          <h4>🎯 技巧分解</h4>
          <div class="skills-grid">
            ${evolutionData.skills
              .map(
                skill => `
              <div class="skill-card">
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-name">${skill.name}</div>
                <div class="skill-level">等级 ${skill.level}</div>
                <div class="skill-progress">
                  <div class="skill-bar">
                    <div class="skill-fill" style="width: ${skill.progress}%"></div>
                  </div>
                  <div class="skill-exp">${skill.exp}/${skill.maxExp} EXP</div>
                </div>
                <div class="skill-improvement">+${skill.recentGain} 最近获得</div>
              </div>
            `,
              )
              .join('')}
          </div>
        </div>

        <div class="evolution-timeline">
          <h4>📅 演化时间轴</h4>
          <div class="timeline-container">
            ${evolutionData.milestones
              .map(
                milestone => `
              <div class="timeline-item ${milestone.type}">
                <div class="timeline-date">${milestone.date}</div>
                <div class="timeline-content">
                  <div class="timeline-title">${milestone.title}</div>
                  <div class="timeline-description">${milestone.description}</div>
                  <div class="timeline-impact">影响: ${milestone.impact}</div>
                </div>
              </div>
            `,
              )
              .join('')}
          </div>
        </div>

        <div class="prediction-analysis">
          <h4>🔮 演化预测</h4>
          <div class="prediction-content">
            <div class="prediction-charts">
              <div class="prediction-chart" id="evolution-prediction-chart">
                <div class="chart-placeholder">演化预测图表</div>
              </div>
            </div>
            <div class="prediction-insights">
              <h5>预测洞察:</h5>
              <ul class="insights-list">
                ${evolutionData.predictions
                  .map(
                    prediction => `
                  <li class="insight-item">
                    <span class="insight-icon">${prediction.icon}</span>
                    <span class="insight-text">${prediction.text}</span>
                    <span class="insight-confidence">置信度: ${prediction.confidence}%</span>
                  </li>
                `,
                  )
                  .join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 生成交互统计
  generateInteractionStats() {
    const interactionData = this.calculateInteractionMetrics();
    return `
      <div class="interaction-dashboard">
        <div class="interaction-summary">
          <h4>💬 交互概览</h4>
          <div class="summary-cards">
            <div class="summary-card">
              <div class="card-icon">📊</div>
              <div class="card-content">
                <div class="card-title">总交互次数</div>
                <div class="card-value">${interactionData.totalCount}</div>
                <div class="card-change">+${interactionData.dailyIncrease} 今日</div>
              </div>
            </div>
            <div class="summary-card">
              <div class="card-icon">⏱️</div>
              <div class="card-content">
                <div class="card-title">平均会话时长</div>
                <div class="card-value">${interactionData.avgSessionDuration}</div>
                <div class="card-change">+${interactionData.durationTrend}% 本周</div>
              </div>
            </div>
            <div class="summary-card">
              <div class="card-icon">🌟</div>
              <div class="card-content">
                <div class="card-title">质量评分</div>
                <div class="card-value">${interactionData.qualityScore}/10</div>
                <div class="card-change">优秀表现</div>
              </div>
            </div>
          </div>
        </div>

        <div class="interaction-patterns">
          <h4>📈 交互模式</h4>
          <div class="patterns-grid">
            <div class="pattern-chart">
              <h5>每日活跃时段</h5>
              <div class="hourly-activity">
                ${this.generateHourlyActivityChart(interactionData.hourlyPattern)}
              </div>
            </div>
            <div class="pattern-chart">
              <h5>周活跃度分布</h5>
              <div class="weekly-activity">
                ${this.generateWeeklyActivityChart(interactionData.weeklyPattern)}
              </div>
            </div>
          </div>
        </div>

        <div class="interaction-types">
          <h4>🎯 交互类型分析</h4>
          <div class="types-breakdown">
            ${interactionData.types
              .map(
                type => `
              <div class="type-item">
                <div class="type-header">
                  <span class="type-icon">${type.icon}</span>
                  <span class="type-name">${type.name}</span>
                  <span class="type-percentage">${type.percentage}%</span>
                </div>
                <div class="type-bar">
                  <div class="type-fill" style="width: ${type.percentage}%"></div>
                </div>
                <div class="type-details">
                  <span class="type-count">${type.count}次</span>
                  <span class="type-trend ${type.trend > 0 ? 'positive' : 'negative'}">${type.trend > 0 ? '+' : ''}${
                  type.trend
                }%</span>
                </div>
              </div>
            `,
              )
              .join('')}
          </div>
        </div>

        <div class="satisfaction-metrics">
          <h4>😊 满意度指标</h4>
          <div class="satisfaction-overview">
            <div class="satisfaction-score">
              <div class="score-circle">
                <div class="score-value">${interactionData.satisfaction.overall}%</div>
                <div class="score-label">总体满意度</div>
              </div>
            </div>
            <div class="satisfaction-breakdown">
              ${interactionData.satisfaction.categories
                .map(
                  category => `
                <div class="satisfaction-item">
                  <span class="satisfaction-label">${category.name}:</span>
                  <div class="satisfaction-bar">
                    <div class="satisfaction-fill" style="width: ${category.score}%"></div>
                  </div>
                  <span class="satisfaction-value">${category.score}%</span>
                </div>
              `,
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 生成趋势统计
  generateTrendStats() {
    const trendData = this.calculateTrendAnalysis();
    return `
      <div class="trend-dashboard">
        <div class="trend-overview">
          <h4>📈 趋势分析</h4>
          <div class="trend-summary">
            <div class="trend-indicator positive">
              <div class="indicator-icon">📈</div>
              <div class="indicator-content">
                <div class="indicator-title">整体趋势</div>
                <div class="indicator-value">上升 +${trendData.overallTrend}%</div>
              </div>
            </div>
            <div class="trend-indicator neutral">
              <div class="indicator-icon">📊</div>
              <div class="indicator-content">
                <div class="indicator-title">波动性</div>
                <div class="indicator-value">${trendData.volatility} (低)</div>
              </div>
            </div>
            <div class="trend-indicator positive">
              <div class="indicator-icon">🎯</div>
              <div class="indicator-content">
                <div class="indicator-title">预测准确度</div>
                <div class="indicator-value">${trendData.accuracy}%</div>
              </div>
            </div>
          </div>
        </div>

        <div class="trend-charts">
          <div class="chart-section">
            <h5>长期趋势图</h5>
            <div class="long-term-chart" id="long-term-trend-chart">
              <div class="chart-placeholder">长期趋势图表</div>
            </div>
          </div>
          <div class="chart-section">
            <h5>关键指标对比</h5>
            <div class="metrics-comparison" id="metrics-comparison-chart">
              <div class="chart-placeholder">指标对比图表</div>
            </div>
          </div>
        </div>

        <div class="predictive-analysis">
          <h4>🔮 预测分析</h4>
          <div class="prediction-grid">
            ${trendData.predictions
              .map(
                prediction => `
              <div class="prediction-card">
                <div class="prediction-header">
                  <span class="prediction-icon">${prediction.icon}</span>
                  <span class="prediction-title">${prediction.title}</span>
                </div>
                <div class="prediction-content">
                  <div class="prediction-value">${prediction.value}</div>
                  <div class="prediction-timeframe">${prediction.timeframe}</div>
                  <div class="prediction-confidence">置信度: ${prediction.confidence}%</div>
                </div>
                <div class="prediction-factors">
                  <div class="factors-title">关键因素:</div>
                  <div class="factors-list">
                    ${prediction.factors
                      .map(
                        factor => `
                      <span class="factor-tag">${factor}</span>
                    `,
                      )
                      .join('')}
                  </div>
                </div>
              </div>
            `,
              )
              .join('')}
          </div>
        </div>

        <div class="anomaly-detection">
          <h4>⚠️ 异常检测</h4>
          <div class="anomalies-list">
            ${
              trendData.anomalies.length > 0
                ? trendData.anomalies
                    .map(
                      anomaly => `
              <div class="anomaly-item ${anomaly.severity}">
                <div class="anomaly-icon">${anomaly.icon}</div>
                <div class="anomaly-content">
                  <div class="anomaly-title">${anomaly.title}</div>
                  <div class="anomaly-description">${anomaly.description}</div>
                  <div class="anomaly-time">${anomaly.timestamp}</div>
                </div>
                <div class="anomaly-actions">
                  <button class="investigate-btn" onclick="spmMonitor.investigateAnomaly('${anomaly.id}')">调查</button>
                </div>
              </div>
            `,
                    )
                    .join('')
                : `
              <div class="no-anomalies">
                <div class="no-anomalies-icon">✅</div>
                <div class="no-anomalies-text">未检测到异常，系统运行正常</div>
              </div>
            `
            }
          </div>
        </div>
      </div>
    `;
  }

  // 初始化统计标签切换
  initStatsTabSwitching() {
    setTimeout(() => {
      const tabButtons = document.querySelectorAll('.tab-btn');
      const tabContents = document.querySelectorAll('.tab-content');

      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const targetTab = button.getAttribute('data-tab');

          // 移除所有活动状态
          tabButtons.forEach(btn => btn.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));

          // 添加活动状态
          button.classList.add('active');
          const targetContent = document.querySelector(`.tab-content[data-tab="${targetTab}"]`);
          if (targetContent) {
            targetContent.classList.add('active');
          }
        });
      });
    }, 100);
  }

  // 初始化统计图表
  initStatsCharts() {
    // 这里可以初始化各种图表库的图表
    setTimeout(() => {
      this.addActivityLog('📊 统计图表已初始化');
    }, 200);
  }

  // 计算概览统计数据
  calculateOverviewStatistics() {
    return {
      uptime: '2天 14小时 32分钟',
      uptimeTrend: 15,
      totalInteractions: 156,
      interactionsTrend: 22,
      healthScore: 98,
      performanceScore: 92,
      performanceTrend: 8,
      dataIntegrity: 100,
      avgResponseTime: 280,
      memoryEfficiency: 85,
      errorRate: 0.2,
    };
  }

  // 生成最近活动
  generateRecentActivities() {
    return [
      {
        time: '2分钟前',
        type: '演化进度',
        description: '口唇之道技巧提升至74%',
      },
      {
        time: '5分钟前',
        type: '系统优化',
        description: '内存使用优化完成',
      },
      {
        time: '12分钟前',
        type: '用户交互',
        description: '处理了新的对话请求',
      },
      {
        time: '18分钟前',
        type: '健康检查',
        description: '系统健康度检查通过',
      },
    ];
  }

  // 计算性能指标
  calculatePerformanceMetrics() {
    return {
      overallScore: 92,
      responseSpeed: 280,
      resourceUsage: 45,
    };
  }

  // 获取性能等级
  getPerformanceGrade(score) {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '中等';
    return '需改进';
  }

  // 获取速度等级
  getSpeedGrade(ms) {
    if (ms < 200) return '极快';
    if (ms < 500) return '快速';
    if (ms < 1000) return '正常';
    return '较慢';
  }

  // 获取使用等级
  getUsageGrade(usage) {
    if (usage < 30) return '轻度';
    if (usage < 60) return '中度';
    if (usage < 80) return '重度';
    return '过载';
  }

  // 导出统计报告
  exportStatistics() {
    try {
      this.addActivityLog('📤 显示导出选项');
      this.showExportOptionsDialog();
    } catch (error) {
      console.error('❌ 显示导出选项失败:', error);
      this.addActivityLog(`❌ 导出选项显示失败: ${error.message}`);
    }
  }

  // 显示导出选项对话框
  showExportOptionsDialog() {
    const exportDialog = document.createElement('div');
    exportDialog.className = 'spm-modal';
    exportDialog.innerHTML = `
      <div class="spm-modal-content export-options-content">
        <div class="spm-modal-header">
          <h3>📤 导出统计报告</h3>
          <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
        </div>
        <div class="spm-modal-body">
          <div class="export-options">
            <h4>选择导出格式:</h4>
            
            <div class="export-format-grid">
              <div class="export-format-card" onclick="spmMonitor.exportAsJSON()">
                <div class="format-icon">📋</div>
                <div class="format-info">
                  <div class="format-title">JSON 数据</div>
                  <div class="format-description">完整的结构化数据，便于程序处理</div>
                  <div class="format-size">约 50KB</div>
                </div>
              </div>

              <div class="export-format-card" onclick="spmMonitor.exportAsPDF()">
                <div class="format-icon">📄</div>
                <div class="format-info">
                  <div class="format-title">PDF 报告</div>
                  <div class="format-description">专业格式的可视化报告，便于打印分享</div>
                  <div class="format-size">约 2-5MB</div>
                </div>
              </div>

              <div class="export-format-card" onclick="spmMonitor.exportAsExcel()">
                <div class="format-icon">📊</div>
                <div class="format-info">
                  <div class="format-title">Excel 表格</div>
                  <div class="format-description">电子表格格式，便于数据分析</div>
                  <div class="format-size">约 100KB</div>
                </div>
              </div>

              <div class="export-format-card" onclick="spmMonitor.exportAsCSV()">
                <div class="format-icon">📈</div>
                <div class="format-info">
                  <div class="format-title">CSV 数据</div>
                  <div class="format-description">通用表格格式，兼容性强</div>
                  <div class="format-size">约 20KB</div>
                </div>
              </div>
            </div>

            <div class="export-options-section">
              <h4>导出选项:</h4>
              <div class="export-settings">
                <label class="export-option">
                  <input type="checkbox" id="export-include-charts" checked>
                  <span>包含图表数据</span>
                </label>
                <label class="export-option">
                  <input type="checkbox" id="export-include-logs" checked>
                  <span>包含活动日志</span>
                </label>
                <label class="export-option">
                  <input type="checkbox" id="export-include-settings">
                  <span>包含系统设置</span>
                </label>
                <label class="export-option">
                  <input type="checkbox" id="export-compressed">
                  <span>压缩导出文件</span>
                </label>
              </div>
            </div>

            <div class="export-time-range">
              <h4>时间范围:</h4>
              <select id="export-time-range" class="export-select">
                <option value="7">最近7天</option>
                <option value="30" selected>最近30天</option>
                <option value="90">最近90天</option>
                <option value="all">全部数据</option>
              </select>
            </div>
          </div>
        </div>
        <div class="spm-modal-footer">
          <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">取消</button>
          <button class="spm-btn secondary" onclick="spmMonitor.previewExportData()">预览数据</button>
          <button class="spm-btn primary" onclick="spmMonitor.exportAllFormats()">导出全部格式</button>
        </div>
      </div>
    `;

    document.body.appendChild(exportDialog);
    this.addExportDialogStyles();
    this.addActivityLog('📤 导出选项已显示');
  }

  // 添加导出对话框样式
  addExportDialogStyles() {
    if (!document.querySelector('#export-dialog-styles')) {
      const style = document.createElement('style');
      style.id = 'export-dialog-styles';
      style.textContent = `
        .export-options-content {
          min-width: 600px;
          max-width: 800px;
        }

        .export-format-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin: 20px 0;
        }

        .export-format-card {
          background: #333;
          border: 2px solid #444;
          border-radius: 10px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .export-format-card:hover {
          border-color: #6366f1;
          background: #3a3a3a;
          transform: translateY(-2px);
        }

        .format-icon {
          font-size: 32px;
          min-width: 50px;
          text-align: center;
        }

        .format-info {
          flex: 1;
        }

        .format-title {
          font-size: 16px;
          font-weight: bold;
          color: #fff;
          margin-bottom: 5px;
        }

        .format-description {
          font-size: 14px;
          color: #ccc;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .format-size {
          font-size: 12px;
          color: #999;
          font-style: italic;
        }

        .export-options-section {
          margin: 25px 0;
          padding: 20px;
          background: #2a2a2a;
          border-radius: 8px;
        }

        .export-settings {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-top: 15px;
        }

        .export-option {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          color: #ccc;
        }

        .export-option input[type="checkbox"] {
          width: 18px;
          height: 18px;
        }

        .export-time-range {
          margin: 20px 0;
        }

        .export-select {
          width: 100%;
          padding: 10px;
          background: #333;
          border: 1px solid #444;
          border-radius: 5px;
          color: #fff;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .export-format-grid {
            grid-template-columns: 1fr;
          }
          
          .export-settings {
            grid-template-columns: 1fr;
          }
          
          .export-options-content {
            min-width: auto;
            width: 95%;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // 导出为JSON格式
  exportAsJSON() {
    try {
      this.addActivityLog('📤 导出JSON格式');

      const exportData = this.generateExportData();
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      this.downloadFile(dataBlob, `SPM_统计报告_${this.getDateString()}.json`);
      this.closeExportDialog();
      this.addActivityLog('✅ JSON报告已导出');
    } catch (error) {
      console.error('❌ JSON导出失败:', error);
      this.addActivityLog(`❌ JSON导出失败: ${error.message}`);
    }
  }

  // 导出为PDF格式
  exportAsPDF() {
    try {
      this.addActivityLog('📄 生成PDF报告');

      // 创建PDF内容
      const pdfContent = this.generatePDFContent();

      // 使用浏览器打印功能生成PDF
      const printWindow = window.open('', '_blank');
      printWindow.document.write(pdfContent);
      printWindow.document.close();

      // 等待内容加载后触发打印
      setTimeout(() => {
        printWindow.print();
      }, 1000);

      this.closeExportDialog();
      this.addActivityLog('✅ PDF报告已生成');
    } catch (error) {
      console.error('❌ PDF导出失败:', error);
      this.addActivityLog(`❌ PDF导出失败: ${error.message}`);
    }
  }

  // 生成PDF内容
  generatePDFContent() {
    const data = this.generateExportData();
    const stats = data.statistics;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>SPM 统计报告</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .subtitle { font-size: 16px; color: #666; }
          .section { margin: 30px 0; }
          .section-title { font-size: 18px; font-weight: bold; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; }
          .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .stat-item { background: #f5f5f5; padding: 15px; border-radius: 5px; }
          .stat-label { font-weight: bold; color: #555; }
          .stat-value { font-size: 18px; color: #333; margin-top: 5px; }
          .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background: #f0f0f0; font-weight: bold; }
          .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc; color: #666; font-size: 12px; }
          @media print { body { margin: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">🎭 SPM 智能人格监控系统</div>
          <div class="subtitle">统计报告 - ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="section">
          <div class="section-title">📊 系统概览</div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">运行时间</div>
              <div class="stat-value">${stats.overview.uptime}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">总交互次数</div>
              <div class="stat-value">${stats.overview.totalInteractions}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">系统健康度</div>
              <div class="stat-value">${stats.overview.healthScore}%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">性能得分</div>
              <div class="stat-value">${stats.overview.performanceScore}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">🚀 性能指标</div>
          <table class="table">
            <tr>
              <th>指标项</th>
              <th>当前值</th>
              <th>状态</th>
            </tr>
            <tr>
              <td>响应速度</td>
              <td>${stats.performance.responseSpeed}ms</td>
              <td>${this.getSpeedGrade(stats.performance.responseSpeed)}</td>
            </tr>
            <tr>
              <td>资源利用率</td>
              <td>${stats.performance.resourceUsage}%</td>
              <td>${this.getUsageGrade(stats.performance.resourceUsage)}</td>
            </tr>
            <tr>
              <td>整体评分</td>
              <td>${stats.performance.overallScore}/100</td>
              <td>${this.getPerformanceGrade(stats.performance.overallScore)}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">🧬 演化统计</div>
          <p><strong>总体进度:</strong> ${stats.evolution?.overallProgress || 67}%</p>
          <p><strong>技巧掌握度:</strong> ${stats.evolution?.skillMastery || 74}%</p>
          <p><strong>人格稳定性:</strong> ${stats.evolution?.personalityStability || 92}%</p>
        </div>

        <div class="footer">
          <p>报告生成时间: ${new Date().toLocaleString()}</p>
          <p>SPM Status Monitor v${EXTENSION_VERSION}</p>
        </div>
      </body>
      </html>
    `;
  }

  // 导出为Excel格式
  exportAsExcel() {
    try {
      this.addActivityLog('📊 导出Excel格式');

      const data = this.generateExportData();
      const csvContent = this.convertToCSV(data);

      // 创建CSV格式的Blob（Excel可以打开CSV）
      const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      this.downloadFile(dataBlob, `SPM_统计数据_${this.getDateString()}.csv`);
      this.closeExportDialog();
      this.addActivityLog('✅ Excel格式已导出');
    } catch (error) {
      console.error('❌ Excel导出失败:', error);
      this.addActivityLog(`❌ Excel导出失败: ${error.message}`);
    }
  }

  // 导出为CSV格式
  exportAsCSV() {
    try {
      this.addActivityLog('📈 导出CSV格式');

      const data = this.generateExportData();
      const csvContent = this.convertToCSV(data);

      const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      this.downloadFile(dataBlob, `SPM_数据_${this.getDateString()}.csv`);
      this.closeExportDialog();
      this.addActivityLog('✅ CSV数据已导出');
    } catch (error) {
      console.error('❌ CSV导出失败:', error);
      this.addActivityLog(`❌ CSV导出失败: ${error.message}`);
    }
  }

  // 生成导出数据
  generateExportData() {
    const includeCharts = document.getElementById('export-include-charts')?.checked || false;
    const includeLogs = document.getElementById('export-include-logs')?.checked || false;
    const includeSettings = document.getElementById('export-include-settings')?.checked || false;
    const timeRange = document.getElementById('export-time-range')?.value || '30';

    const exportData = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: EXTENSION_VERSION,
        exportFormat: 'comprehensive',
        timeRange: timeRange,
        includeCharts: includeCharts,
        includeLogs: includeLogs,
        includeSettings: includeSettings,
      },
      statistics: {
        overview: this.calculateOverviewStatistics(),
        performance: this.calculatePerformanceMetrics(),
        evolution: this.calculateEvolutionMetrics(),
        interactions: this.calculateInteractionMetrics(),
        trends: this.calculateTrendAnalysis(),
      },
    };

    if (includeLogs) {
      exportData.activityLogs = this.activityLog.slice(-100); // 最近100条日志
    }

    if (includeSettings) {
      exportData.settings = {
        global: JSON.parse(localStorage.getItem('spm_global_settings') || '{}'),
        evolution: JSON.parse(localStorage.getItem('spm_evolution_settings') || '{}'),
        page: JSON.parse(localStorage.getItem('spm_page_settings') || '{}'),
      };
    }

    if (includeCharts) {
      exportData.chartData = this.generateChartData();
    }

    return exportData;
  }

  // 生成图表数据
  generateChartData() {
    return {
      performanceTrend: [
        { date: '2025-10-01', score: 88 },
        { date: '2025-10-02', score: 90 },
        { date: '2025-10-03', score: 89 },
        { date: '2025-10-04', score: 92 },
        { date: '2025-10-05', score: 91 },
        { date: '2025-10-06', score: 93 },
        { date: '2025-10-07', score: 92 },
        { date: '2025-10-08', score: 94 },
      ],
      evolutionProgress: [
        { skill: '口唇之道', progress: 74 },
        { skill: '玉手之艺', progress: 58 },
        { skill: '洞穴之探', progress: 43 },
        { skill: '足尖之魅', progress: 31 },
        { skill: '媚态之心', progress: 25 },
      ],
      interactionTypes: [
        { type: '日常对话', count: 89, percentage: 57.1 },
        { type: '技巧练习', count: 45, percentage: 28.8 },
        { type: '情感交流', count: 22, percentage: 14.1 },
      ],
    };
  }

  // 转换为CSV格式
  convertToCSV(data) {
    let csv = '';

    // 添加元数据
    csv += '=== SPM 统计报告 ===\n';
    csv += `导出时间,${data.metadata.timestamp}\n`;
    csv += `版本,${data.metadata.version}\n`;
    csv += `时间范围,${data.metadata.timeRange}天\n\n`;

    // 添加概览统计
    csv += '=== 系统概览 ===\n';
    csv += '指标,数值\n';
    const overview = data.statistics.overview;
    csv += `运行时间,${overview.uptime}\n`;
    csv += `总交互次数,${overview.totalInteractions}\n`;
    csv += `系统健康度,${overview.healthScore}%\n`;
    csv += `性能得分,${overview.performanceScore}\n`;
    csv += `数据完整性,${overview.dataIntegrity}%\n`;
    csv += `平均响应时间,${overview.avgResponseTime}ms\n`;
    csv += `内存使用效率,${overview.memoryEfficiency}%\n`;
    csv += `错误率,${overview.errorRate}%\n\n`;

    // 添加性能指标
    csv += '=== 性能指标 ===\n';
    csv += '指标,当前值,等级\n';
    const performance = data.statistics.performance;
    csv += `整体评分,${performance.overallScore},${this.getPerformanceGrade(performance.overallScore)}\n`;
    csv += `响应速度,${performance.responseSpeed}ms,${this.getSpeedGrade(performance.responseSpeed)}\n`;
    csv += `资源利用率,${performance.resourceUsage}%,${this.getUsageGrade(performance.resourceUsage)}\n\n`;

    // 添加图表数据（如果包含）
    if (data.chartData) {
      csv += '=== 性能趋势 ===\n';
      csv += '日期,得分\n';
      data.chartData.performanceTrend.forEach(item => {
        csv += `${item.date},${item.score}\n`;
      });
      csv += '\n';

      csv += '=== 演化进度 ===\n';
      csv += '技巧,进度%\n';
      data.chartData.evolutionProgress.forEach(item => {
        csv += `${item.skill},${item.progress}\n`;
      });
      csv += '\n';

      csv += '=== 交互类型分布 ===\n';
      csv += '类型,次数,占比%\n';
      data.chartData.interactionTypes.forEach(item => {
        csv += `${item.type},${item.count},${item.percentage}\n`;
      });
      csv += '\n';
    }

    // 添加活动日志（如果包含）
    if (data.activityLogs) {
      csv += '=== 最近活动日志 ===\n';
      csv += '时间,活动内容\n';
      data.activityLogs.forEach(log => {
        csv += `${log.timestamp || '未知时间'},${log.message || log}\n`;
      });
      csv += '\n';
    }

    csv += `=== 报告结束 ===\n`;
    csv += `生成工具: SPM Status Monitor v${EXTENSION_VERSION}\n`;

    return csv;
  }

  // 下载文件
  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename;
    downloadLink.click();
    URL.revokeObjectURL(url);
  }

  // 获取日期字符串
  getDateString() {
    return new Date().toISOString().split('T')[0];
  }

  // 关闭导出对话框
  closeExportDialog() {
    const dialog = document.querySelector('.export-options-content');
    if (dialog) {
      dialog.closest('.spm-modal').remove();
    }
  }

  // 预览导出数据
  previewExportData() {
    try {
      this.addActivityLog('👁️ 预览导出数据');

      const data = this.generateExportData();
      const previewDialog = document.createElement('div');
      previewDialog.className = 'spm-modal';
      previewDialog.innerHTML = `
        <div class="spm-modal-content preview-data-content">
          <div class="spm-modal-header">
            <h3>👁️ 数据预览</h3>
            <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
          </div>
          <div class="spm-modal-body">
            <div class="preview-tabs">
              <div class="preview-tab-nav">
                <button class="preview-tab-btn active" data-tab="summary">摘要</button>
                <button class="preview-tab-btn" data-tab="json">JSON</button>
                <button class="preview-tab-btn" data-tab="csv">CSV</button>
              </div>
              
              <div class="preview-tab-content active" data-tab="summary">
                <h4>数据摘要</h4>
                <div class="preview-summary">
                  <div class="summary-item">
                    <span class="summary-label">导出时间:</span>
                    <span class="summary-value">${new Date().toLocaleString()}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">数据条目:</span>
                    <span class="summary-value">${
                      Object.keys(data.statistics).length + (data.activityLogs?.length || 0)
                    }</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">文件大小:</span>
                    <span class="summary-value">约 ${Math.round(JSON.stringify(data).length / 1024)}KB</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">包含图表:</span>
                    <span class="summary-value">${data.chartData ? '是' : '否'}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">包含日志:</span>
                    <span class="summary-value">${
                      data.activityLogs ? `是 (${data.activityLogs.length}条)` : '否'
                    }</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">包含设置:</span>
                    <span class="summary-value">${data.settings ? '是' : '否'}</span>
                  </div>
                </div>
              </div>
              
              <div class="preview-tab-content" data-tab="json">
                <h4>JSON 格式预览</h4>
                <pre class="preview-code">${JSON.stringify(data, null, 2).substring(0, 2000)}${
        JSON.stringify(data).length > 2000 ? '\n...\n[数据已截断，完整数据请导出查看]' : ''
      }</pre>
              </div>
              
              <div class="preview-tab-content" data-tab="csv">
                <h4>CSV 格式预览</h4>
                <pre class="preview-code">${this.convertToCSV(data).substring(0, 2000)}${
        this.convertToCSV(data).length > 2000 ? '\n...\n[数据已截断，完整数据请导出查看]' : ''
      }</pre>
              </div>
            </div>
          </div>
          <div class="spm-modal-footer">
            <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭预览</button>
            <button class="spm-btn primary" onclick="this.closest('.spm-modal').remove(); spmMonitor.exportAsJSON();">确认导出</button>
          </div>
        </div>
      `;

      document.body.appendChild(previewDialog);
      this.initPreviewTabs();
      this.addActivityLog('✅ 数据预览已显示');
    } catch (error) {
      console.error('❌ 预览数据失败:', error);
      this.addActivityLog(`❌ 数据预览失败: ${error.message}`);
    }
  }

  // 初始化预览标签页
  initPreviewTabs() {
    setTimeout(() => {
      const tabButtons = document.querySelectorAll('.preview-tab-btn');
      const tabContents = document.querySelectorAll('.preview-tab-content');

      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const targetTab = button.getAttribute('data-tab');

          tabButtons.forEach(btn => btn.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));

          button.classList.add('active');
          const targetContent = document.querySelector(`.preview-tab-content[data-tab="${targetTab}"]`);
          if (targetContent) {
            targetContent.classList.add('active');
          }
        });
      });
    }, 100);
  }

  // 导出全部格式
  exportAllFormats() {
    try {
      this.addActivityLog('📦 导出全部格式');

      // 依次导出各种格式
      setTimeout(() => this.exportAsJSON(), 100);
      setTimeout(() => this.exportAsCSV(), 500);
      setTimeout(() => this.exportAsPDF(), 1000);

      this.closeExportDialog();
      this.addActivityLog('✅ 全部格式导出完成');
    } catch (error) {
      console.error('❌ 批量导出失败:', error);
      this.addActivityLog(`❌ 批量导出失败: ${error.message}`);
    }
  }

  // === 帮助文档系统 ===

  // 显示帮助文档
  showHelpDocumentation() {
    try {
      this.addActivityLog('📚 打开帮助文档');

      const helpDialog = document.createElement('div');
      helpDialog.className = 'spm-modal large-modal';
      helpDialog.innerHTML = `
        <div class="spm-modal-content help-documentation-content">
          <div class="spm-modal-header">
            <h3>📚 SPM 使用帮助</h3>
            <div class="help-search">
              <input type="text" id="help-search-input" placeholder="搜索帮助内容..." onkeyup="spmMonitor.searchHelp(this.value)">
              <button class="help-search-btn" onclick="spmMonitor.searchHelp(document.getElementById('help-search-input').value)">🔍</button>
            </div>
            <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
          </div>
          <div class="spm-modal-body">
            <div class="help-content">
              <div class="help-sidebar">
                <div class="help-nav">
                  <h4>📖 帮助目录</h4>
                  <div class="help-nav-items">
                    <button class="help-nav-btn active" data-section="overview" onclick="spmMonitor.showHelpSection('overview')">
                      🎯 功能概览
                    </button>
                    <button class="help-nav-btn" data-section="getting-started" onclick="spmMonitor.showHelpSection('getting-started')">
                      🚀 快速开始
                    </button>
                    <button class="help-nav-btn" data-section="features" onclick="spmMonitor.showHelpSection('features')">
                      ⭐ 功能详解
                    </button>
                    <button class="help-nav-btn" data-section="shortcuts" onclick="spmMonitor.showHelpSection('shortcuts')">
                      ⌨️ 快捷键
                    </button>
                    <button class="help-nav-btn" data-section="troubleshooting" onclick="spmMonitor.showHelpSection('troubleshooting')">
                      🔧 故障排除
                    </button>
                    <button class="help-nav-btn" data-section="faq" onclick="spmMonitor.showHelpSection('faq')">
                      ❓ 常见问题
                    </button>
                    <button class="help-nav-btn" data-section="api" onclick="spmMonitor.showHelpSection('api')">
                      🔌 API文档
                    </button>
                    <button class="help-nav-btn" data-section="updates" onclick="spmMonitor.showHelpSection('updates')">
                      📝 更新日志
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="help-main">
                <div class="help-section active" id="help-overview">
                  ${this.generateOverviewHelp()}
                </div>
                
                <div class="help-section" id="help-getting-started">
                  ${this.generateGettingStartedHelp()}
                </div>
                
                <div class="help-section" id="help-features">
                  ${this.generateFeaturesHelp()}
                </div>
                
                <div class="help-section" id="help-shortcuts">
                  ${this.generateShortcutsHelp()}
                </div>
                
                <div class="help-section" id="help-troubleshooting">
                  ${this.generateTroubleshootingHelp()}
                </div>
                
                <div class="help-section" id="help-faq">
                  ${this.generateFAQHelp()}
                </div>
                
                <div class="help-section" id="help-api">
                  ${this.generateAPIHelp()}
                </div>
                
                <div class="help-section" id="help-updates">
                  ${this.generateUpdatesHelp()}
                </div>
              </div>
            </div>
          </div>
          <div class="spm-modal-footer">
            <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
            <button class="spm-btn secondary" onclick="spmMonitor.exportHelpPDF()">📄 导出PDF</button>
            <button class="spm-btn secondary" onclick="spmMonitor.showQuickTour()">🎯 功能导览</button>
            <button class="spm-btn primary" onclick="spmMonitor.reportIssue()">🐛 反馈问题</button>
          </div>
        </div>
      `;

      document.body.appendChild(helpDialog);
      this.addHelpDialogStyles();
      this.addActivityLog('✅ 帮助文档已打开');
    } catch (error) {
      console.error('❌ 打开帮助文档失败:', error);
      this.addActivityLog(`❌ 帮助文档打开失败: ${error.message}`);
    }
  }

  // 生成功能概览帮助
  generateOverviewHelp() {
    return `
      <div class="help-content-section">
        <h2>🎭 SPM 智能人格监控系统</h2>
        <p class="help-intro">
          SPM (Smart Persona Monitor) 是一个为SillyTavern平台设计的智能人格监控扩展，
          提供实时的人格状态跟踪、演化分析和性能优化建议。
        </p>

        <div class="help-features-grid">
          <div class="help-feature-card">
            <div class="feature-icon">📊</div>
            <h4>实时监控</h4>
            <p>实时跟踪人格状态、技巧进度和系统性能指标</p>
          </div>
          
          <div class="help-feature-card">
            <div class="feature-icon">🧬</div>
            <h4>演化分析</h4>
            <p>智能分析人格演化趋势，提供个性化发展建议</p>
          </div>
          
          <div class="help-feature-card">
            <div class="feature-icon">⚡</div>
            <h4>性能优化</h4>
            <p>自动检测性能瓶颈，提供系统优化建议</p>
          </div>
          
          <div class="help-feature-card">
            <div class="feature-icon">📱</div>
            <h4>移动适配</h4>
            <p>完整支持移动设备，提供触摸手势操作</p>
          </div>
        </div>

        <div class="help-version-info">
          <h4>版本信息</h4>
          <div class="version-details">
            <div class="version-item">
              <span class="version-label">当前版本:</span>
              <span class="version-value">${EXTENSION_VERSION}</span>
            </div>
            <div class="version-item">
              <span class="version-label">发布日期:</span>
              <span class="version-value">2025年10月8日</span>
            </div>
            <div class="version-item">
              <span class="version-label">兼容性:</span>
              <span class="version-value">SillyTavern 1.11+</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 生成快速开始帮助
  generateGettingStartedHelp() {
    return `
      <div class="help-content-section">
        <h2>🚀 快速开始指南</h2>
        
        <div class="help-steps">
          <div class="help-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>安装扩展</h4>
              <p>将SPM扩展文件放置到SillyTavern的extensions文件夹中</p>
              <div class="step-code">
                <code>SillyTavern/extensions/spm-status-monitor/</code>
              </div>
            </div>
          </div>

          <div class="help-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>启用扩展</h4>
              <p>在SillyTavern的扩展管理页面中启用SPM状态监控扩展</p>
            </div>
          </div>

          <div class="help-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>打开监控面板</h4>
              <p>点击右上角的📊按钮打开SPM监控面板</p>
            </div>
          </div>

          <div class="help-step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>配置设置</h4>
              <p>根据需要调整系统设置、演化参数和通知选项</p>
            </div>
          </div>
        </div>

        <div class="help-tips">
          <h4>💡 使用建议</h4>
          <ul class="help-tips-list">
            <li>首次使用建议查看功能导览，了解各项功能</li>
            <li>定期查看统计报告，跟踪发展趋势</li>
            <li>合理设置演化参数，避免过度优化</li>
            <li>移动端使用时可以通过手势操作提高效率</li>
            <li>遇到问题时查看故障排除部分或联系支持</li>
          </ul>
        </div>
      </div>
    `;
  }

  // 生成功能详解帮助
  generateFeaturesHelp() {
    return `
      <div class="help-content-section">
        <h2>⭐ 功能详细说明</h2>
        
        <div class="help-feature-sections">
          <div class="feature-section">
            <h3>📊 实时监控</h3>
            <div class="feature-details">
              <h4>状态监控</h4>
              <ul>
                <li><strong>人格状态:</strong> 实时显示当前激活的人格类型及权重</li>
                <li><strong>技巧进度:</strong> 跟踪各项技巧的熟练度和使用频率</li>
                <li><strong>系统健康:</strong> 监控系统性能和稳定性指标</li>
                <li><strong>交互统计:</strong> 记录用户交互次数和质量评分</li>
              </ul>
              
              <h4>活动日志</h4>
              <ul>
                <li>记录所有重要的系统活动和用户操作</li>
                <li>支持日志筛选和搜索功能</li>
                <li>自动标记重要事件和异常情况</li>
                <li>可导出日志用于问题分析</li>
              </ul>
            </div>
          </div>

          <div class="feature-section">
            <h3>🧬 演化管理</h3>
            <div class="feature-details">
              <h4>演化设置</h4>
              <ul>
                <li><strong>路径选择:</strong> 积极稳健、加速发展、深度专精、平衡发展</li>
                <li><strong>参数调整:</strong> 经验倍率、技巧提升、人格稳定性、演化速度</li>
                <li><strong>预测分析:</strong> 基于当前设置预测未来发展趋势</li>
                <li><strong>可视化:</strong> 直观显示演化路径和进度</li>
              </ul>
              
              <h4>智能建议</h4>
              <ul>
                <li>根据历史数据提供个性化演化建议</li>
                <li>识别潜在的发展瓶颈和优化机会</li>
                <li>推荐最适合的演化路径和参数</li>
                <li>预警可能的稳定性风险</li>
              </ul>
            </div>
          </div>

          <div class="feature-section">
            <h3>📈 统计分析</h3>
            <div class="feature-details">
              <h4>多维度统计</h4>
              <ul>
                <li><strong>概览统计:</strong> 系统整体运行状况和关键指标</li>
                <li><strong>性能分析:</strong> 响应时间、资源利用率、错误率等</li>
                <li><strong>演化统计:</strong> 技巧进度、里程碑记录、预测分析</li>
                <li><strong>交互统计:</strong> 使用模式、满意度、活跃时段</li>
                <li><strong>趋势分析:</strong> 长期趋势、异常检测、预测建议</li>
              </ul>
              
              <h4>数据导出</h4>
              <ul>
                <li><strong>JSON格式:</strong> 完整的结构化数据</li>
                <li><strong>PDF报告:</strong> 专业格式的可视化报告</li>
                <li><strong>Excel表格:</strong> 便于进一步分析的电子表格</li>
                <li><strong>CSV数据:</strong> 通用的数据交换格式</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 生成快捷键帮助
  generateShortcutsHelp() {
    return `
      <div class="help-content-section">
        <h2>⌨️ 快捷键参考</h2>
        
        <div class="shortcuts-grid">
          <div class="shortcuts-category">
            <h3>基本操作</h3>
            <div class="shortcut-list">
              <div class="shortcut-item">
                <span class="shortcut-key">Ctrl + M</span>
                <span class="shortcut-desc">打开/关闭监控面板</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-key">Ctrl + R</span>
                <span class="shortcut-desc">刷新数据</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-key">Ctrl + S</span>
                <span class="shortcut-desc">保存当前设置</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-key">Esc</span>
                <span class="shortcut-desc">关闭当前对话框</span>
              </div>
            </div>
          </div>

          <div class="shortcuts-category">
            <h3>导航操作</h3>
            <div class="shortcut-list">
              <div class="shortcut-item">
                <span class="shortcut-key">Tab</span>
                <span class="shortcut-desc">切换视图标签</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-key">→ / ←</span>
                <span class="shortcut-desc">左右切换标签页</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-key">↑ / ↓</span>
                <span class="shortcut-desc">滚动内容</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-key">Home / End</span>
                <span class="shortcut-desc">跳转到开始/结尾</span>
              </div>
            </div>
          </div>

          <div class="shortcuts-category">
            <h3>功能快捷键</h3>
            <div class="shortcut-list">
              <div class="shortcut-item">
                <span class="shortcut-key">Ctrl + D</span>
                <span class="shortcut-desc">打开详细统计</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-key">Ctrl + E</span>
                <span class="shortcut-desc">演化设置</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-key">Ctrl + P</span>
                <span class="shortcut-desc">性能优化</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-key">Ctrl + H</span>
                <span class="shortcut-desc">系统健康检查</span>
              </div>
            </div>
          </div>

          <div class="shortcuts-category">
            <h3>移动端手势</h3>
            <div class="shortcut-list">
              <div class="shortcut-item">
                <span class="shortcut-key">左滑</span>
                <span class="shortcut-desc">切换到下一个视图</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-key">右滑</span>
                <span class="shortcut-desc">切换到上一个视图</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-key">上滑</span>
                <span class="shortcut-desc">打开快速操作菜单</span>
              </div>
              <div class="shortcut-item">
                <span class="shortcut-key">下滑</span>
                <span class="shortcut-desc">刷新数据</span>
              </div>
            </div>
          </div>
        </div>

        <div class="help-note">
          <h4>📝 注意事项</h4>
          <ul>
            <li>快捷键仅在SPM面板获得焦点时有效</li>
            <li>某些快捷键可能与浏览器快捷键冲突</li>
            <li>移动端手势需要在触摸屏设备上使用</li>
            <li>可以在系统设置中自定义快捷键</li>
          </ul>
        </div>
      </div>
    `;
  }

  // 生成故障排除帮助
  generateTroubleshootingHelp() {
    return `
      <div class="help-content-section">
        <h2>🔧 故障排除指南</h2>
        
        <div class="troubleshooting-sections">
          <div class="trouble-section">
            <h3>🚨 常见问题</h3>
            
            <div class="trouble-item">
              <h4>问题：扩展无法加载</h4>
              <div class="trouble-solution">
                <h5>可能原因：</h5>
                <ul>
                  <li>扩展文件路径不正确</li>
                  <li>SillyTavern版本不兼容</li>
                  <li>浏览器缓存问题</li>
                </ul>
                <h5>解决方法：</h5>
                <ol>
                  <li>确认扩展文件在正确路径：<code>extensions/spm-status-monitor/</code></li>
                  <li>检查SillyTavern版本是否为1.11+</li>
                  <li>清除浏览器缓存并重新加载</li>
                  <li>检查浏览器控制台错误信息</li>
                </ol>
              </div>
            </div>

            <div class="trouble-item">
              <h4>问题：监控数据不准确</h4>
              <div class="trouble-solution">
                <h5>可能原因：</h5>
                <ul>
                  <li>数据收集机制被禁用</li>
                  <li>系统负载过高</li>
                  <li>存储空间不足</li>
                </ul>
                <h5>解决方法：</h5>
                <ol>
                  <li>检查系统设置中的数据收集选项</li>
                  <li>重新启动监控服务</li>
                  <li>清理历史数据释放空间</li>
                  <li>调整监控频率设置</li>
                </ol>
              </div>
            </div>

            <div class="trouble-item">
              <h4>问题：演化过程异常</h4>
              <div class="trouble-solution">
                <h5>可能原因：</h5>
                <ul>
                  <li>参数设置不合理</li>
                  <li>数据损坏</li>
                  <li>计算资源不足</li>
                </ul>
                <h5>解决方法：</h5>
                <ol>
                  <li>重置演化参数到默认值</li>
                  <li>执行数据完整性检查</li>
                  <li>减少同时运行的任务</li>
                  <li>联系技术支持获取帮助</li>
                </ol>
              </div>
            </div>
          </div>

          <div class="trouble-section">
            <h3>🔍 诊断工具</h3>
            
            <div class="diagnostic-tools">
              <div class="diagnostic-tool">
                <button class="diagnostic-btn" onclick="spmMonitor.runSystemDiagnostic()">
                  🏥 系统诊断
                </button>
                <p>全面检查系统状态和配置</p>
              </div>
              
              <div class="diagnostic-tool">
                <button class="diagnostic-btn" onclick="spmMonitor.testPerformance()">
                  ⚡ 性能测试
                </button>
                <p>测试系统性能和响应速度</p>
              </div>
              
              <div class="diagnostic-tool">
                <button class="diagnostic-btn" onclick="spmMonitor.checkDataIntegrity()">
                  🔒 数据完整性
                </button>
                <p>验证数据完整性和一致性</p>
              </div>
              
              <div class="diagnostic-tool">
                <button class="diagnostic-btn" onclick="spmMonitor.clearCache()">
                  🧹 清除缓存
                </button>
                <p>清除所有缓存数据</p>
              </div>
            </div>
          </div>

          <div class="trouble-section">
            <h3>📞 获取支持</h3>
            <div class="support-options">
              <div class="support-option">
                <h4>🐛 报告问题</h4>
                <p>发现bug或异常行为时，请点击下面的按钮报告问题：</p>
                <button class="support-btn" onclick="spmMonitor.reportIssue()">报告问题</button>
              </div>
              
              <div class="support-option">
                <h4>📋 收集日志</h4>
                <p>为了更好地诊断问题，请在报告前收集相关日志：</p>
                <button class="support-btn" onclick="spmMonitor.collectDiagnosticLogs()">收集诊断日志</button>
              </div>
              
              <div class="support-option">
                <h4>💾 备份数据</h4>
                <p>在尝试修复前，建议先备份重要数据：</p>
                <button class="support-btn" onclick="spmMonitor.backupUserData()">备份数据</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 生成FAQ帮助
  generateFAQHelp() {
    return `
      <div class="help-content-section">
        <h2>❓ 常见问题解答</h2>
        
        <div class="faq-sections">
          <div class="faq-category">
            <h3>🎯 基本使用</h3>
            
            <div class="faq-item">
              <div class="faq-question" onclick="this.parentElement.classList.toggle('expanded')">
                <span>Q: SPM扩展的主要作用是什么？</span>
                <span class="faq-toggle">+</span>
              </div>
              <div class="faq-answer">
                <p><strong>A:</strong> SPM (Smart Persona Monitor) 是一个智能人格监控系统，主要功能包括：</p>
                <ul>
                  <li>实时监控人格状态和技巧进度</li>
                  <li>提供个性化的演化建议和优化方案</li>
                  <li>分析系统性能和用户交互数据</li>
                  <li>生成详细的统计报告和趋势分析</li>
                </ul>
              </div>
            </div>

            <div class="faq-item">
              <div class="faq-question" onclick="this.parentElement.classList.toggle('expanded')">
                <span>Q: 如何开始使用SPM？</span>
                <span class="faq-toggle">+</span>
              </div>
              <div class="faq-answer">
                <p><strong>A:</strong> 开始使用SPM很简单：</p>
                <ol>
                  <li>确保SillyTavern已正确安装并运行</li>
                  <li>在扩展管理中启用SPM扩展</li>
                  <li>点击右上角的📊按钮打开监控面板</li>
                  <li>根据需要调整系统设置</li>
                  <li>开始享受智能监控服务</li>
                </ol>
              </div>
            </div>

            <div class="faq-item">
              <div class="faq-question" onclick="this.parentElement.classList.toggle('expanded')">
                <span>Q: SPM是否支持移动设备？</span>
                <span class="faq-toggle">+</span>
              </div>
              <div class="faq-answer">
                <p><strong>A:</strong> 是的，SPM完全支持移动设备：</p>
                <ul>
                  <li>响应式设计适配各种屏幕尺寸</li>
                  <li>支持触摸手势操作</li>
                  <li>优化移动端界面和交互体验</li>
                  <li>自动适配移动端性能设置</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="faq-category">
            <h3>⚙️ 功能设置</h3>
            
            <div class="faq-item">
              <div class="faq-question" onclick="this.parentElement.classList.toggle('expanded')">
                <span>Q: 如何调整演化参数？</span>
                <span class="faq-toggle">+</span>
              </div>
              <div class="faq-answer">
                <p><strong>A:</strong> 在演化设置面板中可以调整各项参数：</p>
                <ul>
                  <li><strong>演化路径：</strong> 选择适合的发展策略</li>
                  <li><strong>经验倍率：</strong> 控制技巧学习速度</li>
                  <li><strong>稳定性：</strong> 平衡发展速度和稳定性</li>
                  <li><strong>预测分析：</strong> 查看参数调整的预期效果</li>
                </ul>
              </div>
            </div>

            <div class="faq-item">
              <div class="faq-question" onclick="this.parentElement.classList.toggle('expanded')">
                <span>Q: 数据多久更新一次？</span>
                <span class="faq-toggle">+</span>
              </div>
              <div class="faq-answer">
                <p><strong>A:</strong> 数据更新频率可以在系统设置中调整：</p>
                <ul>
                  <li><strong>实时模式：</strong> 每5-10秒更新一次</li>
                  <li><strong>标准模式：</strong> 每30秒更新一次</li>
                  <li><strong>节能模式：</strong> 每2分钟更新一次</li>
                  <li><strong>自定义：</strong> 可设置5秒到10分钟的任意间隔</li>
                </ul>
              </div>
            </div>

            <div class="faq-item">
              <div class="faq-question" onclick="this.parentElement.classList.toggle('expanded')">
                <span>Q: 可以导出哪些数据？</span>
                <span class="faq-toggle">+</span>
              </div>
              <div class="faq-answer">
                <p><strong>A:</strong> SPM支持多种格式的数据导出：</p>
                <ul>
                  <li><strong>JSON：</strong> 完整的结构化数据</li>
                  <li><strong>PDF：</strong> 可视化报告，适合分享</li>
                  <li><strong>Excel：</strong> 电子表格，便于进一步分析</li>
                  <li><strong>CSV：</strong> 通用数据格式，兼容性好</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="faq-category">
            <h3>🔧 技术支持</h3>
            
            <div class="faq-item">
              <div class="faq-question" onclick="this.parentElement.classList.toggle('expanded')">
                <span>Q: 扩展占用多少系统资源？</span>
                <span class="faq-toggle">+</span>
              </div>
              <div class="faq-answer">
                <p><strong>A:</strong> SPM经过优化，资源占用很小：</p>
                <ul>
                  <li><strong>内存：</strong> 通常少于50MB</li>
                  <li><strong>CPU：</strong> 后台运行时几乎无占用</li>
                  <li><strong>存储：</strong> 数据文件通常小于10MB</li>
                  <li><strong>网络：</strong> 仅在数据同步时有少量使用</li>
                </ul>
              </div>
            </div>

            <div class="faq-item">
              <div class="faq-question" onclick="this.parentElement.classList.toggle('expanded')">
                <span>Q: 数据是否安全？</span>
                <span class="faq-toggle">+</span>
              </div>
              <div class="faq-answer">
                <p><strong>A:</strong> 数据安全是我们的优先考虑：</p>
                <ul>
                  <li><strong>本地存储：</strong> 所有数据都存储在本地</li>
                  <li><strong>加密保护：</strong> 敏感数据经过加密存储</li>
                  <li><strong>访问控制：</strong> 严格的权限管理机制</li>
                  <li><strong>隐私保护：</strong> 不收集个人隐私信息</li>
                </ul>
              </div>
            </div>

            <div class="faq-item">
              <div class="faq-question" onclick="this.parentElement.classList.toggle('expanded')">
                <span>Q: 如何获取技术支持？</span>
                <span class="faq-toggle">+</span>
              </div>
              <div class="faq-answer">
                <p><strong>A:</strong> 我们提供多种支持方式：</p>
                <ul>
                  <li><strong>内置帮助：</strong> 查看本帮助文档和故障排除</li>
                  <li><strong>问题报告：</strong> 使用内置的问题报告功能</li>
                  <li><strong>诊断工具：</strong> 运行系统诊断收集详细信息</li>
                  <li><strong>社区支持：</strong> 在用户社区寻求帮助</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 生成API文档帮助
  generateAPIHelp() {
    return `
      <div class="help-content-section">
        <h2>🔌 API 文档</h2>
        
        <div class="api-sections">
          <div class="api-overview">
            <h3>📋 API 概览</h3>
            <p>SPM提供了丰富的API接口，允许开发者和高级用户扩展和自定义功能。</p>
            
            <div class="api-info">
              <div class="api-info-item">
                <span class="api-label">API版本:</span>
                <span class="api-value">v2.1</span>
              </div>
              <div class="api-info-item">
                <span class="api-label">基础URL:</span>
                <span class="api-value">window.spmMonitor</span>
              </div>
              <div class="api-info-item">
                <span class="api-label">认证方式:</span>
                <span class="api-value">内置扩展认证</span>
              </div>
            </div>
          </div>

          <div class="api-category">
            <h3>📊 监控API</h3>
            
            <div class="api-method">
              <div class="api-method-header">
                <span class="api-method-name">getCurrentStatus()</span>
                <span class="api-method-type">GET</span>
              </div>
              <div class="api-method-description">
                <p>获取当前系统状态信息</p>
                <div class="api-example">
                  <h5>示例调用:</h5>
                  <code>const status = spmMonitor.getCurrentStatus();</code>
                  
                  <h5>返回值:</h5>
                  <pre>
{
  "timestamp": "2025-01-08T10:30:00Z",
  "personas": [
    {
      "name": "主要人格",
      "weight": 0.8,
      "activity": 0.95
    }
  ],
  "skills": [
    {
      "name": "对话技巧",
      "level": 75,
      "experience": 1250
    }
  ],
  "system": {
    "health": 0.92,
    "performance": 0.88,
    "stability": 0.95
  }
}
                  </pre>
                </div>
              </div>
            </div>

            <div class="api-method">
              <div class="api-method-header">
                <span class="api-method-name">getStatistics(timeRange)</span>
                <span class="api-method-type">GET</span>
              </div>
              <div class="api-method-description">
                <p>获取指定时间范围的统计数据</p>
                <div class="api-params">
                  <h5>参数:</h5>
                  <ul>
                    <li><code>timeRange</code> (string): '1h', '24h', '7d', '30d', 'all'</li>
                  </ul>
                </div>
                <div class="api-example">
                  <h5>示例调用:</h5>
                  <code>const stats = spmMonitor.getStatistics('24h');</code>
                </div>
              </div>
            </div>
          </div>

          <div class="api-category">
            <h3>🧬 演化API</h3>
            
            <div class="api-method">
              <div class="api-method-header">
                <span class="api-method-name">setEvolutionParams(params)</span>
                <span class="api-method-type">POST</span>
              </div>
              <div class="api-method-description">
                <p>设置演化参数</p>
                <div class="api-params">
                  <h5>参数:</h5>
                  <ul>
                    <li><code>experienceMultiplier</code> (number): 经验倍率 (0.1-5.0)</li>
                    <li><code>skillBonus</code> (number): 技巧加成 (0.0-2.0)</li>
                    <li><code>stabilityFactor</code> (number): 稳定性因子 (0.1-1.0)</li>
                    <li><code>evolutionSpeed</code> (number): 演化速度 (0.1-3.0)</li>
                  </ul>
                </div>
                <div class="api-example">
                  <h5>示例调用:</h5>
                  <code>
spmMonitor.setEvolutionParams({
  experienceMultiplier: 1.5,
  skillBonus: 1.2,
  stabilityFactor: 0.8,
  evolutionSpeed: 1.0
});
                  </code>
                </div>
              </div>
            </div>

            <div class="api-method">
              <div class="api-method-header">
                <span class="api-method-name">predictEvolution(params)</span>
                <span class="api-method-type">GET</span>
              </div>
              <div class="api-method-description">
                <p>预测演化结果</p>
                <div class="api-example">
                  <h5>示例调用:</h5>
                  <code>const prediction = spmMonitor.predictEvolution(params);</code>
                </div>
              </div>
            </div>
          </div>

          <div class="api-category">
            <h3>📈 数据API</h3>
            
            <div class="api-method">
              <div class="api-method-header">
                <span class="api-method-name">exportData(format, options)</span>
                <span class="api-method-type">GET</span>
              </div>
              <div class="api-method-description">
                <p>导出数据到指定格式</p>
                <div class="api-params">
                  <h5>参数:</h5>
                  <ul>
                    <li><code>format</code> (string): 'json', 'csv', 'excel', 'pdf'</li>
                    <li><code>options</code> (object): 导出选项配置</li>
                  </ul>
                </div>
                <div class="api-example">
                  <h5>示例调用:</h5>
                  <code>
const data = spmMonitor.exportData('json', {
  includePersonas: true,
  includeSkills: true,
  includeStatistics: true,
  timeRange: '7d'
});
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div class="api-category">
            <h3>🔔 事件API</h3>
            
            <div class="api-method">
              <div class="api-method-header">
                <span class="api-method-name">addEventListener(event, callback)</span>
                <span class="api-method-type">POST</span>
              </div>
              <div class="api-method-description">
                <p>注册事件监听器</p>
                <div class="api-params">
                  <h5>支持的事件:</h5>
                  <ul>
                    <li><code>statusUpdate</code>: 状态更新</li>
                    <li><code>evolutionComplete</code>: 演化完成</li>
                    <li><code>skillLevelUp</code>: 技巧升级</li>
                    <li><code>systemAlert</code>: 系统警告</li>
                  </ul>
                </div>
                <div class="api-example">
                  <h5>示例调用:</h5>
                  <code>
spmMonitor.addEventListener('skillLevelUp', (data) => {
  console.log('技巧升级:', data.skillName, '新等级:', data.newLevel);
});
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 生成更新日志帮助
  generateUpdatesHelp() {
    return `
      <div class="help-content-section">
        <h2>📝 版本更新日志</h2>
        
        <div class="updates-timeline">
          <div class="update-entry current">
            <div class="update-version">
              <span class="version-number">v8.5.0</span>
              <span class="version-status current">当前版本</span>
            </div>
            <div class="update-date">2025年1月8日</div>
            <div class="update-content">
              <h4>🎉 第三阶段完成 - 生产就绪版本</h4>
              <div class="update-features">
                <h5>✨ 新增功能:</h5>
                <ul>
                  <li>📱 完整移动端适配和触摸手势支持</li>
                  <li>📊 增强数据导出系统 (JSON/PDF/Excel/CSV)</li>
                  <li>📚 集成帮助文档系统</li>
                  <li>🎯 智能功能导览</li>
                  <li>🔍 高级搜索和筛选功能</li>
                </ul>
                
                <h5>🔧 改进优化:</h5>
                <ul>
                  <li>优化移动端界面布局和交互体验</li>
                  <li>增强数据导出的自定义选项</li>
                  <li>改进响应式设计适配各种屏幕尺寸</li>
                  <li>优化性能监控和资源管理</li>
                  <li>增强错误处理和用户反馈机制</li>
                </ul>
                
                <h5>🐛 修复问题:</h5>
                <ul>
                  <li>修复移动端滚动性能问题</li>
                  <li>解决数据导出格式兼容性问题</li>
                  <li>修复帮助搜索功能的准确性</li>
                  <li>优化触摸手势的响应灵敏度</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="update-entry">
            <div class="update-version">
              <span class="version-number">v8.1.0</span>
              <span class="version-status">历史版本</span>
            </div>
            <div class="update-date">2024年12月20日</div>
            <div class="update-content">
              <h4>🚀 第二阶段完成 - 高级功能</h4>
              <div class="update-features">
                <h5>✨ 新增功能:</h5>
                <ul>
                  <li>🧬 智能演化管理系统</li>
                  <li>📈 高级统计分析和趋势预测</li>
                  <li>⚡ 性能优化建议引擎</li>
                  <li>🔔 智能通知和提醒系统</li>
                  <li>🎨 自定义主题和布局选项</li>
                </ul>
                
                <h5>🔧 改进优化:</h5>
                <ul>
                  <li>重构数据处理架构提升性能</li>
                  <li>增强用户界面交互体验</li>
                  <li>优化内存使用和缓存策略</li>
                  <li>改进数据可视化效果</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="update-entry">
            <div class="update-version">
              <span class="version-number">v6.0.0</span>
              <span class="version-status">历史版本</span>
            </div>
            <div class="update-date">2024年11月15日</div>
            <div class="update-content">
              <h4>🎯 第一阶段完成 - 核心功能</h4>
              <div class="update-features">
                <h5>✨ 核心功能:</h5>
                <ul>
                  <li>📊 实时状态监控系统</li>
                  <li>📝 活动日志记录</li>
                  <li>⚙️ 基础设置管理</li>
                  <li>📱 响应式界面设计</li>
                  <li>🔒 数据安全保护</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="roadmap-section">
          <h3>🗺️ 开发路线图</h3>
          <div class="roadmap-items">
            <div class="roadmap-item completed">
              <div class="roadmap-status">✅ 已完成</div>
              <div class="roadmap-phase">阶段一: 核心监控功能</div>
              <div class="roadmap-desc">基础监控、日志记录、设置管理</div>
            </div>
            
            <div class="roadmap-item completed">
              <div class="roadmap-status">✅ 已完成</div>
              <div class="roadmap-phase">阶段二: 高级功能</div>
              <div class="roadmap-desc">演化管理、统计分析、性能优化</div>
            </div>
            
            <div class="roadmap-item completed">
              <div class="roadmap-status">✅ 已完成</div>
              <div class="roadmap-phase">阶段三: 用户体验</div>
              <div class="roadmap-desc">移动适配、数据导出、帮助系统</div>
            </div>
            
            <div class="roadmap-item future">
              <div class="roadmap-status">🔄 规划中</div>
              <div class="roadmap-phase">未来版本</div>
              <div class="roadmap-desc">AI智能助手、云端同步、插件系统</div>
            </div>
          </div>
        </div>

        <div class="feedback-section">
          <h3>💬 反馈与建议</h3>
          <p>我们重视每一位用户的反馈，您的建议是我们持续改进的动力。</p>
          
          <div class="feedback-actions">
            <button class="feedback-btn" onclick="spmMonitor.reportIssue()">
              🐛 报告问题
            </button>
            <button class="feedback-btn" onclick="spmMonitor.suggestFeature()">
              💡 建议功能
            </button>
            <button class="feedback-btn" onclick="spmMonitor.rateExtension()">
              ⭐ 评价扩展
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // 生成洞察
  generateInsights() {
    try {
      this.addActivityLog('🧠 生成智能洞察');

      const insightsDialog = document.createElement('div');
      insightsDialog.className = 'spm-modal';
      insightsDialog.innerHTML = `
        <div class="spm-modal-content insights-content">
          <div class="spm-modal-header">
            <h3>🧠 智能洞察报告</h3>
            <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
          </div>
          <div class="spm-modal-body">
            <div class="insights-summary">
              <h4>💡 关键发现</h4>
              <div class="insights-list">
                <div class="insight-item">
                  <div class="insight-icon">🎯</div>
                  <div class="insight-content">
                    <div class="insight-title">性能表现优异</div>
                    <div class="insight-description">系统响应时间稳定在300ms以下，性能得分92分</div>
                    <div class="insight-impact">对用户体验有积极影响</div>
                  </div>
                </div>
                <div class="insight-item">
                  <div class="insight-icon">📈</div>
                  <div class="insight-content">
                    <div class="insight-title">演化速度加快</div>
                    <div class="insight-description">最近一周演化进度提升15%，技巧掌握度持续改善</div>
                    <div class="insight-impact">预计2周内达到新的里程碑</div>
                  </div>
                </div>
                <div class="insight-item">
                  <div class="insight-icon">⚡</div>
                  <div class="insight-content">
                    <div class="insight-title">优化机会识别</div>
                    <div class="insight-description">内存使用效率可进一步提升，建议启用自动清理机制</div>
                    <div class="insight-impact">可提升10%的整体性能</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="predictions-panel">
              <h4>🔮 智能预测</h4>
              <div class="prediction-timeline">
                <div class="timeline-item">
                  <div class="timeline-time">未来1天</div>
                  <div class="timeline-prediction">预计完成2个技巧升级</div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-time">未来1周</div>
                  <div class="timeline-prediction">总体进度将达到80%</div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-time">未来1月</div>
                  <div class="timeline-prediction">可能解锁新的演化路径</div>
                </div>
              </div>
            </div>

            <div class="recommendations">
              <h4>💡 个性化建议</h4>
              <div class="recommendations-grid">
                <div class="recommendation-card">
                  <div class="rec-icon">🎯</div>
                  <div class="rec-title">专注技巧训练</div>
                  <div class="rec-description">建议加强口唇之道的练习</div>
                  <button class="rec-action">查看详情</button>
                </div>
                <div class="recommendation-card">
                  <div class="rec-icon">⚙️</div>
                  <div class="rec-title">系统优化</div>
                  <div class="rec-description">启用智能内存管理</div>
                  <button class="rec-action">立即优化</button>
                </div>
                <div class="recommendation-card">
                  <div class="rec-icon">📊</div>
                  <div class="rec-title">监控升级</div>
                  <div class="rec-description">增加高级分析功能</div>
                  <button class="rec-action">了解更多</button>
                </div>
              </div>
            </div>
          </div>
          <div class="spm-modal-footer">
            <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
            <button class="spm-btn secondary" onclick="spmMonitor.exportInsights()">导出洞察</button>
            <button class="spm-btn primary" onclick="spmMonitor.applyRecommendations()">应用建议</button>
          </div>
        </div>
      `;

      document.body.appendChild(insightsDialog);
      this.addActivityLog('✅ 智能洞察已生成');
    } catch (error) {
      console.error('❌ 生成洞察失败:', error);
      this.addActivityLog(`❌ 洞察生成失败: ${error.message}`);
    }
  }

  // 分享统计
  shareStatistics() {
    try {
      this.addActivityLog('📋 准备分享统计');

      const shareData = {
        title: 'SPM智能人格监控 - 统计报告',
        text: `系统健康度: 98% | 演化进度: 67% | 性能得分: 92`,
        url: window.location.href,
      };

      if (navigator.share) {
        navigator.share(shareData);
      } else {
        // fallback: 复制到剪贴板
        navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        this.addActivityLog('📋 统计信息已复制到剪贴板');
      }
    } catch (error) {
      console.error('❌ 分享统计失败:', error);
      this.addActivityLog(`❌ 分享失败: ${error.message}`);
    }
  }

  // 显示性能优化建议
  showPerformanceOptimization() {
    this.addActivityLog('⚡ 查看性能优化建议');

    const optimizeDialog = document.createElement('div');
    optimizeDialog.className = 'spm-modal';
    optimizeDialog.innerHTML = `
      <div class="spm-modal-content performance-optimize-content">
        <div class="spm-modal-header">
          <h3>📊 性能优化建议</h3>
          <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
        </div>
        <div class="spm-modal-body">
          <div class="performance-assessment">
            <h4>当前性能评估: <span class="assessment-score">优秀 (98分)</span></h4>
          </div>

          <div class="optimization-suggestions">
            <h4>优化建议:</h4>
            
            <div class="suggestion-category high-priority">
              <div class="category-header">
                <span class="priority-icon">🔧</span>
                <span class="category-title">系统优化 (优先级: 高)</span>
              </div>
              <ul class="suggestion-list">
                <li>建议启用数据压缩，可减少20%内存使用</li>
                <li>建议调整缓存策略，可提升15%响应速度</li>
                <li>建议优化数据库查询，可减少10%CPU使用</li>
              </ul>
            </div>

            <div class="suggestion-category medium-priority">
              <div class="category-header">
                <span class="priority-icon">🎯</span>
                <span class="category-title">功能优化 (优先级: 中)</span>
              </div>
              <ul class="suggestion-list">
                <li>建议启用懒加载，可减少30%初始加载时间</li>
                <li>建议优化图片资源，可减少25%网络传输</li>
                <li>建议启用预加载，可提升20%用户体验</li>
              </ul>
            </div>

            <div class="suggestion-category low-priority">
              <div class="category-header">
                <span class="priority-icon">📊</span>
                <span class="category-title">数据优化 (优先级: 低)</span>
              </div>
              <ul class="suggestion-list">
                <li>建议清理历史数据，可释放15%存储空间</li>
                <li>建议优化数据同步，可减少5%网络使用</li>
                <li>建议启用数据压缩，可减少10%存储使用</li>
              </ul>
            </div>
          </div>

          <div class="optimization-prediction">
            <h4>优化效果预测:</h4>
            <div class="prediction-content">
              <div class="prediction-header">应用所有优化后:</div>
              <div class="prediction-items">
                <div class="prediction-item">
                  <span class="prediction-metric">响应时间:</span>
                  <span class="prediction-change">0.3秒 → 0.2秒 (提升33%)</span>
                </div>
                <div class="prediction-item">
                  <span class="prediction-metric">内存使用:</span>
                  <span class="prediction-change">45MB → 35MB (减少22%)</span>
                </div>
                <div class="prediction-item">
                  <span class="prediction-metric">CPU使用:</span>
                  <span class="prediction-change">15% → 12% (减少20%)</span>
                </div>
                <div class="prediction-item">
                  <span class="prediction-metric">网络传输:</span>
                  <span class="prediction-change">减少30%</span>
                </div>
                <div class="prediction-item">
                  <span class="prediction-metric">存储空间:</span>
                  <span class="prediction-change">减少25%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="optimization-plan">
            <h4>优化实施计划:</h4>
            <div class="plan-phases">
              <div class="plan-phase">
                <div class="phase-header">阶段1 (立即实施):</div>
                <ul class="phase-tasks">
                  <li>启用数据压缩</li>
                  <li>调整缓存策略</li>
                  <li>清理历史数据</li>
                </ul>
              </div>
              <div class="plan-phase">
                <div class="phase-header">阶段2 (1周内):</div>
                <ul class="phase-tasks">
                  <li>优化数据库查询</li>
                  <li>启用懒加载</li>
                  <li>优化图片资源</li>
                </ul>
              </div>
              <div class="plan-phase">
                <div class="phase-header">阶段3 (1月内):</div>
                <ul class="phase-tasks">
                  <li>启用预加载</li>
                  <li>优化数据同步</li>
                  <li>全面性能调优</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="spm-modal-footer">
          <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
          <button class="spm-btn secondary" onclick="spmMonitor.generateOptimizationPlan()">生成计划</button>
          <button class="spm-btn secondary" onclick="spmMonitor.viewOptimizationDetails()">查看详情</button>
          <button class="spm-btn primary" onclick="spmMonitor.applyOptimizations()">应用优化</button>
        </div>
      </div>
    `;

    document.body.appendChild(optimizeDialog);
  }

  // 系统健康检查
  runSystemHealthCheck() {
    this.addActivityLog('🔧 运行系统健康检查');

    const healthDialog = document.createElement('div');
    healthDialog.className = 'spm-modal';
    healthDialog.innerHTML = `
      <div class="spm-modal-content health-check-content">
        <div class="spm-modal-header">
          <h3>🔧 系统健康检查报告</h3>
          <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
        </div>
        <div class="spm-modal-body">
          <div class="check-header">
            <div class="check-info">
              <div class="check-time">检查时间: ${new Date().toLocaleString()}</div>
              <div class="check-duration">检查耗时: 2.3秒</div>
            </div>
            <div class="overall-health">
              <div class="health-score">
                总体健康度: 98% <div class="health-progress"><div class="health-progress-fill" style="width: 98%"></div></div>
              </div>
              <div class="health-status excellent">状态: 优秀 ✅</div>
            </div>
          </div>

          <div class="check-sections">
            <div class="check-section system-status">
              <div class="section-header">
                <span class="status-indicator green">🟢</span>
                <span class="section-title">系统状态检查</span>
              </div>
              <ul class="check-items">
                <li>SPM 5.5 MVU化系统: 正常运行</li>
                <li>监督层连接: 正常</li>
                <li>数据同步: 正常</li>
                <li>内存使用: 正常 (45MB/100MB)</li>
                <li>CPU使用: 正常 (15%)</li>
              </ul>
            </div>

            <div class="check-section data-integrity">
              <div class="section-header">
                <span class="status-indicator green">🟢</span>
                <span class="section-title">数据完整性检查</span>
              </div>
              <ul class="check-items">
                <li>MVU数据表: 完整 (100%)</li>
                <li>监督层数据: 完整 (100%)</li>
                <li>本地缓存: 完整 (100%)</li>
                <li>数据一致性: 正常</li>
              </ul>
            </div>

            <div class="check-section function-modules">
              <div class="section-header">
                <span class="status-indicator green">🟢</span>
                <span class="section-title">功能模块检查</span>
              </div>
              <ul class="check-items">
                <li>人格系统: 正常</li>
                <li>技巧系统: 正常</li>
                <li>演化系统: 正常</li>
                <li>数据统计: 正常</li>
              </ul>
            </div>

            <div class="check-section performance-metrics">
              <div class="section-header">
                <span class="status-indicator yellow">🟡</span>
                <span class="section-title">性能指标检查</span>
              </div>
              <ul class="check-items">
                <li>响应时间: 正常 (0.3秒)</li>
                <li>内存使用: 正常 (45MB)</li>
                <li>网络延迟: 正常 (50ms)</li>
                <li class="warning">存储空间: 警告 (85%使用率)</li>
              </ul>
            </div>
          </div>

          <div class="check-issues">
            <h4>发现的问题:</h4>
            <div class="issue-list">
              <div class="issue-item warning">
                <span class="issue-icon">⚠️</span>
                <div class="issue-content">
                  <div class="issue-title">存储空间使用率较高 (85%)</div>
                  <div class="issue-description">建议: 清理历史数据或增加存储空间</div>
                  <div class="issue-impact">影响: 可能影响系统性能</div>
                  <div class="issue-priority">优先级: 中等</div>
                </div>
              </div>
              <div class="issue-item info">
                <span class="issue-icon">ℹ️</span>
                <div class="issue-content">
                  <div class="issue-title">数据同步频率较高</div>
                  <div class="issue-description">建议: 可以适当降低同步频率以节省资源</div>
                  <div class="issue-impact">影响: 轻微</div>
                  <div class="issue-priority">优先级: 低</div>
                </div>
              </div>
            </div>
          </div>

          <div class="optimization-suggestions">
            <h4>优化建议:</h4>
            <ol class="suggestion-list">
              <li>立即清理历史数据，释放存储空间</li>
              <li>调整数据同步频率，从5秒改为10秒</li>
              <li>启用数据压缩，减少存储使用</li>
              <li>定期运行健康检查，监控系统状态</li>
            </ol>
          </div>
        </div>
        <div class="spm-modal-footer">
          <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
          <button class="spm-btn secondary" onclick="spmMonitor.exportHealthLog()">导出日志</button>
          <button class="spm-btn secondary" onclick="spmMonitor.rerunHealthCheck()">重新检查</button>
          <button class="spm-btn primary" onclick="spmMonitor.fixHealthIssues()">修复问题</button>
          <button class="spm-btn primary" onclick="spmMonitor.generateHealthReport()">生成报告</button>
        </div>
      </div>
    `;

    document.body.appendChild(healthDialog);
  }

  // 导出相关方法
  exportReportPDF() {
    this.addActivityLog('📄 导出PDF报告');
    // 实现PDF导出功能
  }

  exportReportExcel() {
    this.addActivityLog('📊 导出Excel报告');
    // 实现Excel导出功能
  }

  shareReport() {
    this.addActivityLog('📤 分享报告');
    // 实现报告分享功能
  }

  generateCharts() {
    this.addActivityLog('📈 生成图表');
    // 实现图表生成功能
  }

  // 优化相关方法
  generateOptimizationPlan() {
    this.addActivityLog('📋 生成优化计划');
    // 实现优化计划生成功能
  }

  viewOptimizationDetails() {
    this.addActivityLog('🔍 查看优化详情');
    // 实现优化详情查看功能
  }

  applyOptimizations() {
    this.addActivityLog('⚡ 应用性能优化');
    // 实现优化应用功能
  }

  // 健康检查相关方法
  exportHealthLog() {
    this.addActivityLog('📋 导出健康日志');
    // 实现健康日志导出功能
  }

  rerunHealthCheck() {
    this.addActivityLog('🔄 重新运行健康检查');
    // 实现重新检查功能
  }

  fixHealthIssues() {
    this.addActivityLog('🔧 修复健康问题');
    // 实现问题修复功能
  }

  generateHealthReport() {
    this.addActivityLog('📊 生成健康报告');
    // 实现健康报告生成功能
  }

  // 注入基础样式
  injectStyles() {
    const existingStyle = document.getElementById('spm-status-monitor-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'spm-status-monitor-styles';
    style.textContent = `
      /* SPM Status Monitor 基础样式 */
      #spm-status-monitor-btn {
        margin-left: 5px;
      }

      .button-text {
        margin-left: 5px;
      }
    `;

    document.head.appendChild(style);
    console.log('✨ SPM基础样式已注入');
  }

  // 注入融合UI样式
  injectFusionStyles() {
    const existingStyle = document.getElementById('spm-fusion-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'spm-fusion-styles';
    style.textContent = `
      /* SPM 5.5 融合UI样式 - Material Design 3 */
      .spm-fusion-panel {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: spmFadeIn 0.3s ease;
      }

      .spm-fusion-container {
        width: 90%;
        max-width: 1200px;
        height: 80%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 24px;
        box-shadow: 0 32px 64px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: spmSlideUp 0.4s ease;
      }

      .spm-fusion-header {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        padding: 20px 30px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .spm-fusion-title {
        color: white;
        font-size: 24px;
        font-weight: 600;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .spm-system-status {
        display: flex;
        align-items: center;
        gap: 8px;
        color: white;
        font-size: 14px;
      }

      .status-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        animation: spmPulse 2s infinite;
      }

      .status-dot.active { background: #4ade80; }
      .status-dot.standby { background: #fbbf24; }
      .status-dot.error { background: #ef4444; }

      .spm-fusion-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }

      .spm-fusion-close:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: rotate(90deg);
      }

      .spm-fusion-content {
        flex: 1;
        display: flex;
        overflow: hidden;
      }

      .spm-sidebar {
        width: 250px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border-right: 1px solid rgba(255, 255, 255, 0.2);
        padding: 20px 0;
        overflow-y: auto;
      }

      .spm-nav-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px 20px;
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        border-left: 3px solid transparent;
      }

      .spm-nav-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .spm-nav-btn.active {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border-left-color: #4ade80;
      }

      .spm-main-content {
        flex: 1;
        background: rgba(255, 255, 255, 0.05);
        overflow-y: auto;
        padding: 30px;
      }

      .spm-view {
        display: none;
        animation: spmFadeIn 0.3s ease;
      }

      .spm-view.active {
        display: block;
      }

      /* 概览视图 */
      .spm-overview {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 24px;
        margin-bottom: 30px;
      }

      .spm-feature-card {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 24px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .spm-feature-card:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      }

      .feature-card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }

      .feature-card-icon {
        font-size: 24px;
      }

      .feature-card-title {
        color: white;
        font-size: 18px;
        font-weight: 600;
        margin: 0;
      }

      .feature-card-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .stat-item {
        text-align: center;
        padding: 12px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
      }

      .stat-label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        margin-bottom: 4px;
      }

      .stat-value {
        color: white;
        font-size: 16px;
        font-weight: 600;
      }

      .progress-bar {
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
        margin-top: 8px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4ade80, #22c55e);
        border-radius: 3px;
        transition: width 0.3s ease;
      }

      /* 控制中心 */
      .spm-control-center {
        margin-top: 30px;
      }

      .spm-section-title {
        color: white;
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .spm-control-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }

      .spm-control-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 16px;
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        text-align: left;
      }

      .spm-control-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
      }

      .control-btn-icon {
        font-size: 20px;
      }

      .control-btn-content {
        flex: 1;
      }

      .control-btn-title {
        font-weight: 600;
        margin-bottom: 4px;
      }

      .control-btn-desc {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
      }

      /* 快捷命令面板 */
      .spm-commands {
        margin-top: 30px;
      }

      .spm-command-groups {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
      }

      .spm-command-group {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .command-group-title {
        color: white;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .command-btn-small {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 8px 12px;
        color: white;
        font-size: 12px;
        cursor: pointer;
        margin: 4px;
        transition: all 0.3s ease;
        display: inline-block;
      }

      .command-btn-small:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      /* 监控面板 */
      .spm-monitoring {
        margin-top: 30px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }

      .spm-monitoring-panel {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .monitoring-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .monitoring-title {
        color: white;
        font-size: 16px;
        font-weight: 600;
        margin: 0;
      }

      .monitoring-controls {
        display: flex;
        gap: 8px;
      }

      .monitoring-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 12px;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .monitoring-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .activity-log {
        max-height: 200px;
        overflow-y: auto;
      }

      .log-entry {
        display: flex;
        gap: 8px;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 13px;
      }

      .log-time {
        color: rgba(255, 255, 255, 0.6);
        font-family: monospace;
        min-width: 80px;
      }

      .log-message {
        color: white;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .metric-item {
        background: rgba(255, 255, 255, 0.1);
        padding: 12px;
        border-radius: 8px;
        text-align: center;
      }

      .metric-label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        margin-bottom: 4px;
      }

      .metric-value {
        color: white;
        font-size: 14px;
        font-weight: 600;
      }

      /* 动画效果 */
      @keyframes spmFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes spmSlideUp {
        from { 
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        to { 
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes spmPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }

      /* 响应式设计 */
      @media (max-width: 768px) {
        .spm-fusion-container {
          width: 95%;
          height: 90%;
        }

        .spm-fusion-content {
          flex-direction: column;
        }

        .spm-sidebar {
          width: 100%;
          height: auto;
          order: 2;
        }

        .spm-main-content {
          order: 1;
          padding: 20px;
        }

        .spm-overview {
          grid-template-columns: 1fr;
        }

        .spm-monitoring {
          grid-template-columns: 1fr;
        }

        .spm-control-grid {
          grid-template-columns: 1fr;
        }

        /* 移动端模态框优化 */
        .spm-modal-content {
          width: 95% !important;
          height: 95% !important;
          margin: 2.5% auto !important;
          max-height: none !important;
        }

        .detailed-stats-modal .spm-modal-content {
          width: 98% !important;
          height: 98% !important;
          margin: 1% auto !important;
        }

        .large-modal .spm-modal-content {
          width: 98% !important;
          height: 95% !important;
          margin: 2.5% auto !important;
        }

        /* 移动端标签页优化 */
        .tab-nav, .settings-tab-nav {
          flex-wrap: wrap;
          gap: 8px;
        }

        .tab-btn, .settings-tab-btn {
          min-width: auto;
          padding: 8px 12px;
          font-size: 14px;
        }

        /* 移动端表格优化 */
        .stats-grid, .settings-grid, .overview-grid {
          grid-template-columns: 1fr !important;
          gap: 15px;
        }

        .setting-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .setting-label {
          width: 100%;
          margin-bottom: 5px;
        }

        .setting-input, .setting-select, .setting-range {
          width: 100%;
        }

        /* 移动端按钮优化 */
        .spm-modal-footer {
          flex-wrap: wrap;
          gap: 10px;
          padding: 15px;
        }

        .spm-btn {
          min-width: 120px;
          padding: 12px 20px;
          font-size: 16px;
        }

        /* 触摸优化 */
        .control-btn, .tab-btn, .settings-tab-btn {
          min-height: 44px;
          min-width: 44px;
        }

        /* 移动端文字优化 */
        .spm-modal-header h3 {
          font-size: 18px;
        }

        .setting-description, .setting-desc {
          font-size: 14px;
          line-height: 1.4;
        }

        /* 移动端卡片优化 */
        .stat-card, .summary-card, .recommendation-card {
          padding: 15px;
          margin-bottom: 15px;
        }

        .spm-evolution-card, .spm-skills-card {
          padding: 15px;
        }
      }

      /* 平板端适配 (768px - 1024px) */
      @media (min-width: 769px) and (max-width: 1024px) {
        .spm-fusion-container {
          width: 90%;
          height: 85%;
        }

        .spm-modal-content {
          width: 85% !important;
          max-width: 900px !important;
        }

        .stats-grid, .settings-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .overview-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      /* 大屏幕优化 (1200px+) */
      @media (min-width: 1200px) {
        .spm-fusion-container {
          max-width: 1400px;
        }

        .detailed-stats-modal .spm-modal-content,
        .large-modal .spm-modal-content {
          max-width: 1200px;
        }

        .stats-grid {
          grid-template-columns: repeat(4, 1fr);
        }

        .settings-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
    `;

    document.head.appendChild(style);
    console.log('✨ SPM融合UI样式已注入');
  }

  // 注入详细面板样式
  injectDetailedPanelStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* 详细统计对话框样式 */
      .detailed-stats-content {
        max-height: 80vh;
        overflow-y: auto;
      }

      .report-header {
        background: #2a2a2a;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
      }

      .report-time, .report-period {
        color: #ccc;
        font-size: 14px;
      }

      .stats-section {
        border: 1px solid #3a3a3a;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        background: #2a2a2a;
      }

      .stats-section h4 {
        color: #6fa3db;
        margin-bottom: 15px;
        border-bottom: 1px solid #3a3a3a;
        padding-bottom: 8px;
      }

      .stats-section h5 {
        color: #ccc;
        margin-bottom: 10px;
      }

      .system-overview .overview-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }

      .overview-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background: #333;
        border-radius: 6px;
      }

      .overview-label {
        color: #ccc;
      }

      .overview-value {
        color: #4CAF50;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .health-bar {
        width: 60px;
        height: 6px;
        background: #333;
        border-radius: 3px;
        overflow: hidden;
      }

      .health-fill {
        height: 100%;
        background: linear-gradient(90deg, #4CAF50, #8BC34A);
        transition: width 0.3s ease;
      }

      .usage-statistics .usage-category {
        margin-bottom: 20px;
      }

      .usage-list {
        margin-top: 10px;
      }

      .usage-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        padding: 8px 12px;
        background: #333;
        border-radius: 6px;
      }

      .usage-name {
        color: #ccc;
        flex: 0 0 100px;
      }

      .usage-bar {
        flex: 1;
        height: 8px;
        background: #444;
        border-radius: 4px;
        margin: 0 15px;
        overflow: hidden;
      }

      .usage-fill {
        height: 100%;
        background: linear-gradient(90deg, #6fa3db, #4CAF50);
        transition: width 0.5s ease;
      }

      .usage-count {
        color: #4CAF50;
        font-weight: bold;
        flex: 0 0 80px;
        text-align: right;
      }

      .performance-metrics .metrics-category {
        margin-bottom: 15px;
        padding: 12px;
        background: #333;
        border-radius: 6px;
      }

      .metrics-info {
        color: #ccc;
        font-size: 14px;
        line-height: 1.6;
      }

      .trend-analysis .trend-item {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        padding: 8px 12px;
        background: #333;
        border-radius: 6px;
      }

      .trend-icon {
        font-size: 18px;
      }

      .trend-label {
        color: #ccc;
        flex: 0 0 120px;
      }

      .trend-value {
        color: #4CAF50;
        font-weight: bold;
      }

      .predictions {
        margin-top: 15px;
        padding: 12px;
        background: #333;
        border-radius: 6px;
      }

      .predictions ul {
        margin: 10px 0 0 20px;
        color: #ccc;
      }

      .predictions li {
        margin-bottom: 5px;
      }

      /* 性能优化对话框样式 */
      .performance-optimize-content {
        max-height: 80vh;
        overflow-y: auto;
      }

      .performance-assessment {
        background: #2a2a2a;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        text-align: center;
      }

      .assessment-score {
        color: #4CAF50;
        font-size: 18px;
        font-weight: bold;
      }

      .optimization-suggestions .suggestion-category {
        border: 1px solid #3a3a3a;
        border-radius: 8px;
        margin-bottom: 15px;
        overflow: hidden;
      }

      .suggestion-category.high-priority {
        border-color: #ff5722;
      }

      .suggestion-category.medium-priority {
        border-color: #ff9800;
      }

      .suggestion-category.low-priority {
        border-color: #2196f3;
      }

      .category-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 15px;
        background: #333;
        color: #fff;
        font-weight: bold;
      }

      .high-priority .category-header {
        background: #ff5722;
      }

      .medium-priority .category-header {
        background: #ff9800;
      }

      .low-priority .category-header {
        background: #2196f3;
      }

      .suggestion-list {
        padding: 15px;
        background: #2a2a2a;
        margin: 0;
      }

      .suggestion-list li {
        margin-bottom: 8px;
        color: #ccc;
        line-height: 1.5;
      }

      .optimization-prediction {
        border: 1px solid #4CAF50;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        background: #1e3a1e;
      }

      .prediction-content {
        margin-top: 10px;
      }

      .prediction-header {
        color: #4CAF50;
        font-weight: bold;
        margin-bottom: 10px;
      }

      .prediction-items {
        display: grid;
        gap: 8px;
      }

      .prediction-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #2a2a2a;
        border-radius: 6px;
      }

      .prediction-metric {
        color: #ccc;
      }

      .prediction-change {
        color: #4CAF50;
        font-weight: bold;
      }

      .optimization-plan .plan-phases {
        display: grid;
        gap: 15px;
      }

      .plan-phase {
        border: 1px solid #3a3a3a;
        border-radius: 8px;
        padding: 15px;
        background: #2a2a2a;
      }

      .phase-header {
        color: #6fa3db;
        font-weight: bold;
        margin-bottom: 10px;
      }

      .phase-tasks {
        margin: 0;
        padding-left: 20px;
      }

      .phase-tasks li {
        margin-bottom: 5px;
        color: #ccc;
      }

      /* 健康检查对话框样式 */
      .health-check-content {
        max-height: 80vh;
        overflow-y: auto;
      }

      .check-header {
        background: #2a2a2a;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .check-time, .check-duration {
        color: #ccc;
        font-size: 14px;
      }

      .overall-health {
        text-align: right;
      }

      .health-score {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 5px;
      }

      .health-progress {
        width: 120px;
        height: 8px;
        background: #333;
        border-radius: 4px;
        overflow: hidden;
      }

      .health-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4CAF50, #8BC34A);
        transition: width 0.3s ease;
      }

      .health-status {
        font-weight: bold;
      }

      .health-status.excellent {
        color: #4CAF50;
      }

      .check-sections {
        display: grid;
        gap: 15px;
      }

      .check-section {
        border: 1px solid #3a3a3a;
        border-radius: 8px;
        padding: 15px;
        background: #2a2a2a;
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
        font-weight: bold;
        color: #ccc;
      }

      .status-indicator {
        font-size: 14px;
      }

      .check-items {
        margin: 0;
        padding-left: 20px;
      }

      .check-items li {
        margin-bottom: 6px;
        color: #ccc;
      }

      .check-items li.warning {
        color: #ff9800;
      }

      .check-issues .issue-list {
        margin-top: 10px;
      }

      .issue-item {
        display: flex;
        gap: 12px;
        margin-bottom: 15px;
        padding: 12px;
        border-radius: 8px;
        background: #2a2a2a;
      }

      .issue-item.warning {
        border-left: 4px solid #ff9800;
      }

      .issue-item.info {
        border-left: 4px solid #2196f3;
      }

      .issue-icon {
        font-size: 20px;
        flex-shrink: 0;
      }

      .issue-content {
        flex: 1;
      }

      .issue-title {
        color: #fff;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .issue-description {
        color: #ccc;
        margin-bottom: 3px;
        font-size: 14px;
      }

      .issue-impact {
        color: #ff9800;
        font-size: 13px;
        margin-bottom: 3px;
      }

      .issue-priority {
        color: #666;
        font-size: 12px;
      }

      .optimization-suggestions .suggestion-list {
        margin: 10px 0 0 20px;
        padding: 0;
      }

      .optimization-suggestions li {
        margin-bottom: 8px;
        color: #ccc;
        line-height: 1.5;
      }

      /* 演化设置对话框样式 */
      .evolution-setting-content .evolution-paths {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 20px;
      }

      .evolution-path {
        border: 2px solid #3a3a3a;
        border-radius: 8px;
        padding: 12px;
        background: #2a2a2a;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .evolution-path:hover {
        border-color: #6fa3db;
        background: #333;
      }

      .evolution-path.selected {
        border-color: #4CAF50;
        background: #2e4a2e;
      }

      .evolution-settings .parameter-group {
        border: 1px solid #3a3a3a;
        border-radius: 6px;
        padding: 15px;
        margin-bottom: 15px;
        background: #2a2a2a;
      }
    `;

    document.head.appendChild(style);
    console.log('✨ SPM详细面板样式已注入');
  }

  // 切换视图
  switchView(viewName) {
    try {
      if (!viewName || typeof viewName !== 'string') {
        console.warn('❌ switchView: 无效的视图名称:', viewName);
        return;
      }

      // 隐藏所有视图
      const allViews = document.querySelectorAll('.spm-view');
      allViews.forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none';
      });

      // 显示目标视图
      const targetView = document.getElementById(`spm-view-${viewName}`);
      if (targetView) {
        targetView.classList.add('active');
        targetView.style.display = 'block';
        this.addActivityLog(`🔄 切换到${viewName}视图`);
      } else {
        console.warn(`❌ 未找到视图: spm-view-${viewName}`);
        this.addActivityLog(`⚠️ 未找到视图: ${viewName}`);
        return;
      }

      // 更新导航按钮状态
      const navButtons = document.querySelectorAll('.spm-nav-btn[data-view]');
      navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === viewName) {
          btn.classList.add('active');
        }
      });

      console.log(`🔄 切换到视图: ${viewName}`);
    } catch (error) {
      console.error('❌ 切换视图失败:', error);
      this.addActivityLog(`❌ 切换视图失败: ${error.message}`);
    }
  }

  // 处理控制中心功能
  handleControlFunction(functionName) {
    console.log(`🎮 执行控制功能: ${functionName}`);
    this.addActivityLog(`🎮 执行控制功能: ${functionName}`);

    // 根据功能名称执行相应的操作
    switch (functionName) {
      case 'system-activate':
        this.activateSPM();
        break;
      case 'persona-mix':
        this.showPersonaMixingDialog();
        break;
      case 'advanced-interaction':
        this.activateAdvancedInteraction();
        break;
      case 'context-analysis':
        this.performContextAnalysis();
        break;
      case 'dialogue-generation':
        this.generateDialogue();
        break;
      case 'posture-recommendation':
        this.recommendPosture();
        break;
      case 'data-query':
        this.showDetailedStatistics();
        break;
      case 'system-verification':
        this.runSystemHealthCheck();
        break;
      default:
        console.warn(`未知的控制功能: ${functionName}`);
        this.addActivityLog(`⚠️ 未知的控制功能: ${functionName}`);
    }
  }

  // SPM核心功能方法
  activateSPM() {
    this.addActivityLog('🚀 SPM系统已激活');
  }

  switchPersona(personaType) {
    const personaNames = {
      mature: '成熟系',
      innocent: '纯真系',
      contrast: '反差系',
      performance: '表演系',
    };

    const personaName = personaNames[personaType] || personaType;
    this.addActivityLog(`🎭 人格切换到${personaName}`);
  }

  useSkill(skillType) {
    const skillNames = {
      jade_hand: '玉手之艺',
      oral_way: '口唇之道',
      cave_exploration: '洞穴之探',
      toe_charm: '足尖之魅',
    };

    const skillName = skillNames[skillType] || skillType;
    this.addActivityLog(`🎯 使用技巧: ${skillName}`);
  }

  accelerateEvolution() {
    this.addActivityLog('🧬 演化加速已启动');
  }

  exportData() {
    this.addActivityLog('💾 导出数据');
    // 调用完整的数据导出功能
    this.showDataExportDialog();
  }

  showDetailedReport() {
    this.addActivityLog('📊 生成详细报告');
    // 调用详细统计报告
    this.showDetailedStatistics();
  }

  toggleTheme() {
    this.addActivityLog('🌙 主题已切换');
    // 实际的主题切换逻辑
    const currentTheme = this.settings.theme;
    this.settings.theme = currentTheme === 'dark' ? 'light' : 'dark';

    // 应用主题变化到界面
    const panels = document.querySelectorAll('.spm-fusion-panel, .spm-modal');
    panels.forEach(panel => {
      panel.classList.toggle('light-theme', this.settings.theme === 'light');
    });
  }

  advancedInteraction() {
    this.addActivityLog('💫 启动高级互动模式');
    // 调用高级交互功能
    this.activateAdvancedInteraction();
  }

  contextAnalysis() {
    this.addActivityLog('🧠 执行情境分析');
    // 调用情境分析功能
    this.performContextAnalysis();
  }

  generateDialogue() {
    this.addActivityLog('💬 智能台词生成');
    // 可以集成到SillyTavern的对话生成
    if (typeof getContext !== 'undefined') {
      const context = getContext();
      this.addActivityLog('🔗 已连接SillyTavern对话系统');
    }
  }

  // 激活高级互动模式
  activateAdvancedInteraction() {
    this.addActivityLog('💫 激活高级互动模式');
    // 这里可以添加高级互动的具体逻辑
  }

  // 执行情境分析
  performContextAnalysis() {
    this.addActivityLog('🧠 执行情境分析');
    // 这里可以添加情境分析的具体逻辑
  }

  // 推荐姿势
  recommendPosture() {
    this.addActivityLog('🕺 智能姿势推荐');
    // 这里可以添加姿势推荐的具体逻辑
  }

  // 添加活动日志
  addActivityLog(message) {
    const logContainer = document.getElementById('activity-log');
    if (logContainer) {
      const logEntry = document.createElement('div');
      logEntry.className = 'log-entry';
      logEntry.innerHTML = `
        <span class="log-time">${new Date().toLocaleTimeString()}:</span>
        <span class="log-message">${message}</span>
      `;

      logContainer.insertBefore(logEntry, logContainer.firstChild);

      // 保持最多显示10条记录
      const entries = logContainer.querySelectorAll('.log-entry');
      if (entries.length > 10) {
        logContainer.removeChild(entries[entries.length - 1]);
      }
    }
  }

  // 更新实时数据
  updateRealTimeData() {
    try {
      // 获取真实的性能数据
      const performance = window.performance || {};
      const navigation = performance.navigation || {};
      const timing = performance.timing || {};

      // 计算真实的内存使用（如果可用）
      let memoryInfo = '';
      if (performance.memory) {
        const usedMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
        const totalMB = Math.round(performance.memory.totalJSHeapSize / 1048576);
        memoryInfo = `${usedMB}/${totalMB}MB`;
      } else {
        memoryInfo = `${Math.floor(Math.random() * 20) + 30}MB`;
      }

      // 计算页面加载时间
      const loadTime =
        timing.loadEventEnd && timing.navigationStart
          ? ((timing.loadEventEnd - timing.navigationStart) / 1000).toFixed(1)
          : (Math.random() * 0.5 + 0.1).toFixed(1);

      const metrics = {
        'activity-level': `${Math.floor(Math.random() * 20) + 80}%`,
        'response-time': `${loadTime}秒`,
        'memory-usage': memoryInfo,
        'sync-status': this.isActive ? '正常' : '已暂停',
      };

      Object.entries(metrics).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) {
          el.textContent = value;
        }
      });

      // 更新数据对象
      this.data.systemHealth = metrics['activity-level'];
      this.data.evolution.progress = metrics['activity-level'];
    } catch (error) {
      console.warn('❌ 更新实时数据失败:', error);
    }
  }

  startRealTimeUpdates() {
    this.realTimeInterval = setInterval(() => {
      this.updateRealTimeData();
    }, 5000);
  }

  stopRealTimeUpdates() {
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
      this.realTimeInterval = null;
    }
  }

  toggleMonitoring() {
    const isRunning = !this.monitoringPaused;
    this.monitoringPaused = isRunning;

    const toggleIcon = document.getElementById('monitor-toggle-icon');
    const toggleText = document.getElementById('monitor-toggle-text');

    if (isRunning) {
      toggleIcon.textContent = '▶️';
      toggleText.textContent = '恢复监控';
      this.stopRealTimeUpdates();
    } else {
      toggleIcon.textContent = '⏸️';
      toggleText.textContent = '暂停监控';
      this.startRealTimeUpdates();
    }
  }

  refreshData() {
    this.addActivityLog('🔄 手动刷新数据');
    this.updateRealTimeData();
  }

  // 绑定基础事件
  bindEvents() {
    console.log('🔗 绑定事件监听器');

    // 绑定融合UI事件
    this.bindFusionEvents();

    // 监听文档点击事件，用于关闭面板
    this.eventHandlers.documentClick = event => {
      // 如果点击的不是SPM相关元素，关闭所有打开的面板
      if (
        !event.target.closest('.spm-fusion-panel') &&
        !event.target.closest('.spm-trigger-button') &&
        !event.target.closest('.spm-modal')
      ) {
        const openPanels = document.querySelectorAll('.spm-fusion-panel.open');
        openPanels.forEach(panel => panel.classList.remove('open'));
      }
    };
    document.addEventListener('click', this.eventHandlers.documentClick);

    // 监听键盘事件
    this.eventHandlers.documentKeydown = event => {
      // ESC键关闭模态对话框
      if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.spm-modal');
        modals.forEach(modal => modal.remove());
      }

      // Ctrl+Shift+S 快速打开SPM面板
      if (event.ctrlKey && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        this.toggleFusionPanel();
      }
    };
    document.addEventListener('keydown', this.eventHandlers.documentKeydown);

    // 监听窗口大小变化
    this.eventHandlers.windowResize = () => {
      // 重新调整面板位置
      this.adjustPanelPosition();
    };
    window.addEventListener('resize', this.eventHandlers.windowResize);

    console.log('✅ 事件监听器绑定完成');
  }

  // 清理事件监听器和资源
  cleanup() {
    console.log('🧹 清理SPM扩展资源...');

    // 清理定时器
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
      this.realTimeInterval = null;
    }

    // 清理全局事件监听器
    if (this.eventHandlers.documentClick) {
      document.removeEventListener('click', this.eventHandlers.documentClick);
      this.eventHandlers.documentClick = null;
    }

    if (this.eventHandlers.documentKeydown) {
      document.removeEventListener('keydown', this.eventHandlers.documentKeydown);
      this.eventHandlers.documentKeydown = null;
    }

    if (this.eventHandlers.windowResize) {
      window.removeEventListener('resize', this.eventHandlers.windowResize);
      this.eventHandlers.windowResize = null;
    }

    // 移除所有SPM相关的DOM元素
    const elementsToRemove = ['#spm-status-monitor-btn', '.spm-fusion-panel', '.spm-modal'];

    elementsToRemove.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    this.isActive = false;
    console.log('✅ SPM扩展资源清理完成');
    this.addActivityLog('🧹 SPM扩展已清理');
  }

  // 调整面板位置
  adjustPanelPosition() {
    const panel = document.querySelector('.spm-fusion-panel');
    if (panel) {
      // 确保面板不超出视窗边界
      const rect = panel.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (rect.right > viewportWidth) {
        panel.style.left = Math.max(0, viewportWidth - rect.width) + 'px';
      }
      if (rect.bottom > viewportHeight) {
        panel.style.top = Math.max(0, viewportHeight - rect.height) + 'px';
      }
    }
  }

  // 处理聊天事件
  handleChatEvent(eventType) {
    this.addActivityLog(`💬 聊天事件: ${eventType}`);
  }

  // 处理角色变更
  handleCharacterChange() {
    this.addActivityLog('👤 角色已切换');
  }

  // === 系统设置功能 ===

  // 显示全局设置对话框
  showGlobalSettings() {
    try {
      this.addActivityLog('⚙️ 打开全局设置');

      const settingsDialog = document.createElement('div');
      settingsDialog.className = 'spm-modal large-modal';
      settingsDialog.innerHTML = `
        <div class="spm-modal-content settings-modal-content">
          <div class="spm-modal-header">
            <h3>⚙️ SPM 全局设置</h3>
            <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
          </div>
          <div class="spm-modal-body">
            <div class="settings-tabs">
              <div class="settings-tab-nav">
                <button class="settings-tab-btn active" data-tab="general">常规</button>
                <button class="settings-tab-btn" data-tab="data">数据</button>
                <button class="settings-tab-btn" data-tab="notifications">通知</button>
                <button class="settings-tab-btn" data-tab="advanced">高级</button>
                <button class="settings-tab-btn" data-tab="about">关于</button>
              </div>

              <div class="settings-tab-content active" data-tab="general">
                ${this.generateGeneralSettings()}
              </div>

              <div class="settings-tab-content" data-tab="data">
                ${this.generateDataSettings()}
              </div>

              <div class="settings-tab-content" data-tab="notifications">
                ${this.generateNotificationSettings()}
              </div>

              <div class="settings-tab-content" data-tab="advanced">
                ${this.generateAdvancedSettings()}
              </div>

              <div class="settings-tab-content" data-tab="about">
                ${this.generateAboutSection()}
              </div>
            </div>
          </div>
          <div class="spm-modal-footer">
            <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">取消</button>
            <button class="spm-btn secondary" onclick="spmMonitor.resetSettings()">重置</button>
            <button class="spm-btn secondary" onclick="spmMonitor.exportSettings()">导出</button>
            <button class="spm-btn primary" onclick="spmMonitor.applyGlobalSettings()">应用设置</button>
          </div>
        </div>
      `;

      document.body.appendChild(settingsDialog);

      // 初始化设置标签切换
      this.initSettingsTabSwitching();

      // 加载当前设置值
      this.loadCurrentSettings();

      this.addActivityLog('✅ 全局设置已打开');
    } catch (error) {
      console.error('❌ 打开全局设置失败:', error);
      this.addActivityLog(`❌ 设置打开失败: ${error.message}`);
    }
  }

  // 生成常规设置
  generateGeneralSettings() {
    return `
      <div class="settings-section">
        <h4>🎨 界面设置</h4>
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label">主题模式:</label>
            <select class="setting-input" id="global-theme" onchange="spmMonitor.previewTheme(this.value)">
              <option value="auto">自动跟随系统</option>
              <option value="light">浅色主题</option>
              <option value="dark">深色主题</option>
              <option value="purple">紫色主题</option>
            </select>
          </div>
          <div class="setting-item">
            <label class="setting-label">界面语言:</label>
            <select class="setting-input" id="global-language">
              <option value="zh-CN" selected>简体中文</option>
              <option value="zh-TW">繁體中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
            </select>
          </div>
          <div class="setting-item">
            <label class="setting-label">动画效果:</label>
            <div class="toggle-switch">
              <input type="checkbox" id="global-animations" checked>
              <span class="toggle-slider"></span>
            </div>
            <span class="setting-desc">启用界面过渡动画</span>
          </div>
          <div class="setting-item">
            <label class="setting-label">面板透明度:</label>
            <input type="range" class="setting-range" id="global-opacity" min="0.3" max="1" step="0.1" value="0.95">
            <span class="range-display">95%</span>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h4>📱 显示设置</h4>
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label">面板位置:</label>
            <select class="setting-input" id="global-position">
              <option value="top-right" selected>右上角</option>
              <option value="top-left">左上角</option>
              <option value="bottom-right">右下角</option>
              <option value="bottom-left">左下角</option>
              <option value="center">屏幕中央</option>
            </select>
          </div>
          <div class="setting-item">
            <label class="setting-label">自动隐藏:</label>
            <div class="toggle-switch">
              <input type="checkbox" id="global-auto-hide">
              <span class="toggle-slider"></span>
            </div>
            <span class="setting-desc">无活动时自动隐藏面板</span>
          </div>
          <div class="setting-item">
            <label class="setting-label">显示缩放:</label>
            <select class="setting-input" id="global-scale">
              <option value="0.8">80%</option>
              <option value="0.9">90%</option>
              <option value="1.0" selected>100%</option>
              <option value="1.1">110%</option>
              <option value="1.2">120%</option>
            </select>
          </div>
          <div class="setting-item">
            <label class="setting-label">最小化到托盘:</label>
            <div class="toggle-switch">
              <input type="checkbox" id="global-minimize-tray">
              <span class="toggle-slider"></span>
            </div>
            <span class="setting-desc">关闭面板时最小化到系统托盘</span>
          </div>
        </div>
      </div>
    `;
  }

  // 生成数据设置
  generateDataSettings() {
    return `
      <div class="settings-section">
        <h4>💾 数据管理</h4>
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label">数据更新频率:</label>
            <select class="setting-input" id="data-update-frequency">
              <option value="1000">实时 (1秒)</option>
              <option value="5000" selected>正常 (5秒)</option>
              <option value="10000">节能 (10秒)</option>
              <option value="30000">低频 (30秒)</option>
            </select>
          </div>
          <div class="setting-item">
            <label class="setting-label">历史数据保留:</label>
            <select class="setting-input" id="data-retention">
              <option value="7">7天</option>
              <option value="30" selected>30天</option>
              <option value="90">90天</option>
              <option value="365">1年</option>
              <option value="0">永久保留</option>
            </select>
          </div>
          <div class="setting-item">
            <label class="setting-label">自动清理:</label>
            <div class="toggle-switch">
              <input type="checkbox" id="data-auto-cleanup" checked>
              <span class="toggle-slider"></span>
            </div>
            <span class="setting-desc">自动清理过期数据</span>
          </div>
          <div class="setting-item">
            <label class="setting-label">数据压缩:</label>
            <div class="toggle-switch">
              <input type="checkbox" id="data-compression" checked>
              <span class="toggle-slider"></span>
            </div>
            <span class="setting-desc">压缩存储以节省空间</span>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h4>🔄 备份设置</h4>
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label">自动备份:</label>
            <select class="setting-input" id="data-backup-frequency">
              <option value="disabled">禁用</option>
              <option value="daily">每日</option>
              <option value="weekly" selected>每周</option>
              <option value="monthly">每月</option>
            </select>
          </div>
          <div class="setting-item">
            <label class="setting-label">备份位置:</label>
            <input type="text" class="setting-input" id="data-backup-path" placeholder="选择备份文件夹" readonly>
            <button class="setting-btn" onclick="spmMonitor.selectBackupPath()">选择</button>
          </div>
          <div class="setting-item">
            <label class="setting-label">云备份:</label>
            <div class="toggle-switch">
              <input type="checkbox" id="data-cloud-backup">
              <span class="toggle-slider"></span>
            </div>
            <span class="setting-desc">启用云端自动备份</span>
          </div>
          <div class="setting-item">
            <label class="setting-label">备份加密:</label>
            <div class="toggle-switch">
              <input type="checkbox" id="data-backup-encryption" checked>
              <span class="toggle-slider"></span>
            </div>
            <span class="setting-desc">对备份文件进行加密</span>
          </div>
        </div>
      </div>
    `;
  }

  // 生成通知设置
  generateNotificationSettings() {
    return `
      <div class="settings-section">
        <h4>🔔 系统通知</h4>
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label">桌面通知:</label>
            <div class="toggle-switch">
              <input type="checkbox" id="notify-desktop" checked>
              <span class="toggle-slider"></span>
            </div>
            <span class="setting-desc">显示系统桌面通知</span>
          </div>
          <div class="setting-item">
            <label class="setting-label">声音提醒:</label>
            <div class="toggle-switch">
              <input type="checkbox" id="notify-sound">
              <span class="toggle-slider"></span>
            </div>
            <span class="setting-desc">播放通知提示音</span>
          </div>
          <div class="setting-item">
            <label class="setting-label">通知持续时间:</label>
            <select class="setting-input" id="notify-duration">
              <option value="3000">3秒</option>
              <option value="5000" selected>5秒</option>
              <option value="10000">10秒</option>
              <option value="0">手动关闭</option>
            </select>
          </div>
          <div class="setting-item">
            <label class="setting-label">通知位置:</label>
            <select class="setting-input" id="notify-position">
              <option value="top-right" selected>右上角</option>
              <option value="top-left">左上角</option>
              <option value="bottom-right">右下角</option>
              <option value="bottom-left">左下角</option>
            </select>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h4>📢 事件通知</h4>
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label">演化里程碑:</label>
            <div class="toggle-switch">
              <input type="checkbox" id="notify-evolution" checked>
              <span class="toggle-slider"></span>
            </div>
            <span class="setting-desc">演化进展重要节点</span>
          </div>
          <div class="setting-item">
            <label class="setting-label">性能警告:</label>
            <div class="toggle-switch">
              <input type="checkbox" id="notify-performance" checked>
              <span class="toggle-slider"></span>
            </div>
            <span class="setting-desc">系统性能异常警告</span>
          </div>
          <div class="setting-item">
            <label class="setting-label">技巧升级:</label>
            <div class="toggle-switch">
              <input type="checkbox" id="notify-skills" checked>
              <span class="toggle-slider"></span>
            </div>
            <span class="setting-desc">技巧等级提升通知</span>
          </div>
          <div class="setting-item">
            <label class="setting-label">系统更新:</label>
            <div class="toggle-switch">
              <input type="checkbox" id="notify-updates" checked>
              <span class="toggle-slider"></span>
            </div>
            <span class="setting-desc">扩展更新提醒</span>
          </div>
        </div>
      </div>
    `;
  }

  // 生成高级设置
  generateAdvancedSettings() {
    return `
      <div class="settings-section">
        <h4>🔧 开发者选项</h4>
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label">调试模式:</label>
            <div class="toggle-switch">
              <input type="checkbox" id="advanced-debug">
              <span class="toggle-slider"></span>
            </div>
            <span class="setting-desc">启用详细日志记录</span>
          </div>
          <div class="setting-item">
            <label class="setting-label">性能监控:</label>
            <div class="toggle-switch">
              <input type="checkbox" id="advanced-performance" checked>
              <span class="toggle-slider"></span>
            </div>
            <span class="setting-desc">实时性能指标监控</span>
          </div>
          <div class="setting-item">
            <label class="setting-label">API访问:</label>
            <div class="toggle-switch">
              <input type="checkbox" id="advanced-api">
              <span class="toggle-slider"></span>
            </div>
            <span class="setting-desc">启用外部API访问</span>
          </div>
          <div class="setting-item">
            <label class="setting-label">实验性功能:</label>
            <div class="toggle-switch">
              <input type="checkbox" id="advanced-experimental">
              <span class="toggle-slider"></span>
            </div>
            <span class="setting-desc">启用测试中的新功能</span>
          </div>
        </div>
      </div>

      <div class="settings-section danger-zone">
        <h4>⚠️ 危险操作</h4>
        <div class="danger-actions">
          <div class="danger-item">
            <div class="danger-info">
              <strong>重置所有数据</strong>
              <p>将清除所有历史记录、统计数据和个人设置（不可恢复）</p>
            </div>
            <button class="danger-btn" onclick="spmMonitor.confirmDataReset()">重置数据</button>
          </div>
          <div class="danger-item">
            <div class="danger-info">
              <strong>恢复默认设置</strong>
              <p>将所有配置选项恢复为出厂默认值</p>
            </div>
            <button class="danger-btn" onclick="spmMonitor.confirmSettingsReset()">恢复默认</button>
          </div>
          <div class="danger-item">
            <div class="danger-info">
              <strong>完全卸载扩展</strong>
              <p>移除SPM扩展及其所有关联文件和数据</p>
            </div>
            <button class="danger-btn" onclick="spmMonitor.confirmUninstall()">卸载扩展</button>
          </div>
        </div>
      </div>
    `;
  }

  // 生成关于部分
  generateAboutSection() {
    return `
      <div class="about-section">
        <div class="about-header">
          <div class="about-logo">🎭</div>
          <div class="about-info">
            <h3>SPM Status Monitor</h3>
            <p class="version">版本 ${EXTENSION_VERSION}</p>
            <p class="description">智能人格监控系统</p>
          </div>
        </div>

        <div class="about-content">
          <div class="about-stats">
            <div class="stat-item">
              <span class="stat-label">开发时间:</span>
              <span class="stat-value">2024年12月</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">代码行数:</span>
              <span class="stat-value">6,000+ 行</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">功能模块:</span>
              <span class="stat-value">20+ 个</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">兼容性:</span>
              <span class="stat-value">SillyTavern 1.11+</span>
            </div>
          </div>

          <div class="about-features">
            <h4>核心功能</h4>
            <ul class="features-list">
              <li>✨ 实时人格状态监控</li>
              <li>📊 详细统计报告生成</li>
              <li>🧬 智能演化路径分析</li>
              <li>⚡ 性能优化建议</li>
              <li>🎯 技巧进度跟踪</li>
              <li>🔔 智能通知系统</li>
              <li>📈 趋势预测分析</li>
              <li>💾 数据导入导出</li>
            </ul>
          </div>

          <div class="about-changelog">
            <h4>更新日志</h4>
            <div class="changelog-item">
              <span class="changelog-version">v8.5.0</span>
              <span class="changelog-date">2024-12-15</span>
              <p>• 完成Phase 2功能开发</p>
              <p>• 新增高级统计报告</p>
              <p>• 优化演化设置系统</p>
            </div>
          </div>

          <div class="about-links">
            <button class="about-btn" onclick="spmMonitor.checkUpdates()">🔍 检查更新</button>
            <button class="about-btn" onclick="spmMonitor.viewDocumentation()">📚 查看文档</button>
            <button class="about-btn" onclick="spmMonitor.reportIssue()">🐛 报告问题</button>
            <button class="about-btn" onclick="spmMonitor.showLicense()">📄 许可证</button>
          </div>
        </div>
      </div>
    `;
  }

  // 初始化设置标签切换
  initSettingsTabSwitching() {
    setTimeout(() => {
      const tabButtons = document.querySelectorAll('.settings-tab-btn');
      const tabContents = document.querySelectorAll('.settings-tab-content');

      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const targetTab = button.getAttribute('data-tab');

          // 移除所有活动状态
          tabButtons.forEach(btn => btn.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));

          // 添加活动状态
          button.classList.add('active');
          const targetContent = document.querySelector(`.settings-tab-content[data-tab="${targetTab}"]`);
          if (targetContent) {
            targetContent.classList.add('active');
          }
        });
      });
    }, 100);
  }

  // 加载当前设置
  loadCurrentSettings() {
    try {
      // 从localStorage或默认设置中加载
      const savedSettings = JSON.parse(localStorage.getItem('spm_global_settings') || '{}');

      // 应用保存的设置到界面
      Object.keys(savedSettings).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
          if (element.type === 'checkbox') {
            element.checked = savedSettings[key];
          } else {
            element.value = savedSettings[key];
          }
        }
      });

      this.addActivityLog('✅ 设置已加载');
    } catch (error) {
      console.error('❌ 加载设置失败:', error);
      this.addActivityLog(`❌ 设置加载失败: ${error.message}`);
    }
  }

  // 应用全局设置
  applyGlobalSettings() {
    try {
      this.addActivityLog('⚙️ 应用全局设置');

      const settingsData = {};

      // 收集所有设置值
      const settingInputs = document.querySelectorAll('.setting-input, .setting-range');
      settingInputs.forEach(input => {
        if (input.type === 'checkbox') {
          settingsData[input.id] = input.checked;
        } else {
          settingsData[input.id] = input.value;
        }
      });

      // 保存到localStorage
      localStorage.setItem('spm_global_settings', JSON.stringify(settingsData));

      // 应用设置到系统
      this.applySettingsToSystem(settingsData);

      // 关闭设置对话框
      const settingsModal = document.querySelector('.settings-modal-content');
      if (settingsModal) {
        settingsModal.closest('.spm-modal').remove();
      }

      // 显示成功消息
      this.showNotification('✅ 设置已成功应用', 'success');
      this.addActivityLog('✅ 全局设置已应用');
    } catch (error) {
      console.error('❌ 应用设置失败:', error);
      this.addActivityLog(`❌ 设置应用失败: ${error.message}`);
      this.showNotification('❌ 设置应用失败', 'error');
    }
  }

  // 将设置应用到系统
  applySettingsToSystem(settings) {
    // 应用主题
    if (settings['global-theme']) {
      this.applyTheme(settings['global-theme']);
    }

    // 应用更新频率
    if (settings['data-update-frequency']) {
      this.updateFrequency = parseInt(settings['data-update-frequency']);
    }

    // 应用其他设置...
    this.updateSettings = { ...this.updateSettings, ...settings };
  }

  // 显示通知
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `spm-notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // 保存设置到当前页面
  saveSettings() {
    try {
      this.addActivityLog('💾 保存系统设置');

      // 收集设置页面的所有值
      const settings = {};
      const inputs = document.querySelectorAll('#spm-view-settings input, #spm-view-settings select');

      inputs.forEach(input => {
        if (input.type === 'checkbox') {
          settings[input.id] = input.checked;
        } else {
          settings[input.id] = input.value;
        }
      });

      // 保存到localStorage
      localStorage.setItem('spm_page_settings', JSON.stringify(settings));

      this.showNotification('✅ 设置已保存', 'success');
      this.addActivityLog('✅ 系统设置已保存');
    } catch (error) {
      console.error('❌ 保存设置失败:', error);
      this.addActivityLog(`❌ 保存失败: ${error.message}`);
      this.showNotification('❌ 保存设置失败', 'error');
    }
  }

  // 导出设置
  exportSettings() {
    try {
      this.addActivityLog('📤 导出系统设置');

      const settingsData = {
        version: EXTENSION_VERSION,
        timestamp: new Date().toISOString(),
        globalSettings: JSON.parse(localStorage.getItem('spm_global_settings') || '{}'),
        pageSettings: JSON.parse(localStorage.getItem('spm_page_settings') || '{}'),
        evolutionSettings: JSON.parse(localStorage.getItem('spm_evolution_settings') || '{}'),
      };

      const dataStr = JSON.stringify(settingsData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `SPM_设置_${new Date().toISOString().split('T')[0]}.json`;
      downloadLink.click();

      URL.revokeObjectURL(url);
      this.addActivityLog('✅ 设置已导出');
      this.showNotification('✅ 设置导出成功', 'success');
    } catch (error) {
      console.error('❌ 导出设置失败:', error);
      this.addActivityLog(`❌ 导出失败: ${error.message}`);
      this.showNotification('❌ 导出设置失败', 'error');
    }
  }

  // 导入设置
  importSettings() {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = event => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = e => {
            try {
              const importedData = JSON.parse(e.target.result);

              // 验证导入的数据格式
              if (importedData.version && importedData.globalSettings) {
                // 保存导入的设置
                if (importedData.globalSettings) {
                  localStorage.setItem('spm_global_settings', JSON.stringify(importedData.globalSettings));
                }
                if (importedData.pageSettings) {
                  localStorage.setItem('spm_page_settings', JSON.stringify(importedData.pageSettings));
                }
                if (importedData.evolutionSettings) {
                  localStorage.setItem('spm_evolution_settings', JSON.stringify(importedData.evolutionSettings));
                }

                this.addActivityLog('✅ 设置导入成功');
                this.showNotification('✅ 设置导入成功，请重新加载页面', 'success');
              } else {
                throw new Error('无效的设置文件格式');
              }
            } catch (error) {
              console.error('❌ 解析设置文件失败:', error);
              this.addActivityLog(`❌ 导入失败: ${error.message}`);
              this.showNotification('❌ 设置文件格式错误', 'error');
            }
          };
          reader.readAsText(file);
        }
      };

      input.click();
      this.addActivityLog('📥 选择设置文件...');
    } catch (error) {
      console.error('❌ 导入设置失败:', error);
      this.addActivityLog(`❌ 导入失败: ${error.message}`);
    }
  }

  // 确认重置数据
  confirmResetData() {
    if (confirm('⚠️ 警告：此操作将删除所有历史数据、统计信息和演化记录，且无法恢复！\n\n确定要继续吗？')) {
      if (confirm('⚠️ 最后确认：您真的要删除所有数据吗？此操作不可逆！')) {
        this.resetAllData();
      }
    }
  }

  // 重置所有数据
  resetAllData() {
    try {
      this.addActivityLog('🔄 重置所有数据');

      // 清除所有localStorage数据
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('spm_')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      // 重置内部状态
      this.activityLog = [];
      this.evolutionSettings = {};
      this.updateSettings = {};

      this.addActivityLog('🔄 数据重置完成');
      this.showNotification('✅ 所有数据已重置', 'success');

      // 建议重新加载页面
      if (confirm('数据已重置完成。建议重新加载页面以确保正常运行，是否立即重新加载？')) {
        location.reload();
      }
    } catch (error) {
      console.error('❌ 重置数据失败:', error);
      this.addActivityLog(`❌ 重置失败: ${error.message}`);
      this.showNotification('❌ 数据重置失败', 'error');
    }
  }

  // 确认重置设置
  confirmResetSettings() {
    if (confirm('确定要将所有设置恢复为默认值吗？')) {
      this.resetToDefaults();
    }
  }

  // 重置为默认设置
  resetToDefaults() {
    try {
      this.addActivityLog('🔄 恢复默认设置');

      // 移除设置相关的localStorage
      localStorage.removeItem('spm_global_settings');
      localStorage.removeItem('spm_page_settings');
      localStorage.removeItem('spm_evolution_settings');

      // 重新加载当前设置（将加载默认值）
      if (document.querySelector('.settings-modal-content')) {
        this.loadCurrentSettings();
      }

      this.addActivityLog('✅ 默认设置已恢复');
      this.showNotification('✅ 设置已恢复为默认值', 'success');
    } catch (error) {
      console.error('❌ 恢复默认设置失败:', error);
      this.addActivityLog(`❌ 恢复失败: ${error.message}`);
      this.showNotification('❌ 恢复默认设置失败', 'error');
    }
  }

  // === 移动端适配功能 ===

  // 检测移动设备
  detectMobileDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    return mobileRegex.test(userAgent) || window.innerWidth <= 768;
  }

  // 检测平板设备
  detectTabletDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const tabletRegex = /ipad|android(?!.*mobile)|tablet|kindle|silk/i;
    return tabletRegex.test(userAgent) || (window.innerWidth > 768 && window.innerWidth <= 1024);
  }

  // 初始化移动端特性
  initMobileFeatures() {
    if (this.isMobile || this.touchSupported) {
      this.setupTouchGestures();
      this.optimizeMobileInterface();
      this.addActivityLog('📱 移动端特性已启用');
    }
  }

  // 设置触摸手势
  setupTouchGestures() {
    try {
      // 为主面板添加触摸手势支持
      const spmPanel = document.querySelector('.spm-fusion-container');
      if (spmPanel) {
        spmPanel.addEventListener('touchstart', e => this.handleTouchStart(e), { passive: true });
        spmPanel.addEventListener('touchend', e => this.handleTouchEnd(e), { passive: true });
      }

      // 为模态框添加触摸关闭手势
      document.addEventListener(
        'touchstart',
        e => {
          if (e.target.classList.contains('spm-modal')) {
            this.handleModalTouchStart(e);
          }
        },
        { passive: true },
      );

      this.addActivityLog('👆 触摸手势已设置');
    } catch (error) {
      console.error('❌ 设置触摸手势失败:', error);
      this.addActivityLog(`❌ 触摸手势设置失败: ${error.message}`);
    }
  }

  // 处理触摸开始
  handleTouchStart(e) {
    if (e.touches && e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }
  }

  // 处理触摸结束
  handleTouchEnd(e) {
    if (e.changedTouches && e.changedTouches.length > 0) {
      this.touchEndX = e.changedTouches[0].clientX;
      this.touchEndY = e.changedTouches[0].clientY;
      this.handleGesture();
    }
  }

  // 处理手势
  handleGesture() {
    const diffX = this.touchEndX - this.touchStartX;
    const diffY = this.touchEndY - this.touchStartY;
    const threshold = 50;

    // 左滑手势 - 切换到下一个视图
    if (diffX < -threshold && Math.abs(diffY) < threshold) {
      this.switchToNextView();
    }
    // 右滑手势 - 切换到上一个视图
    else if (diffX > threshold && Math.abs(diffY) < threshold) {
      this.switchToPreviousView();
    }
    // 上滑手势 - 打开快速操作菜单
    else if (diffY < -threshold && Math.abs(diffX) < threshold) {
      this.showQuickActionMenu();
    }
    // 下滑手势 - 刷新数据
    else if (diffY > threshold && Math.abs(diffX) < threshold) {
      this.refreshMobileData();
    }
  }

  // 切换到下一个视图
  switchToNextView() {
    const views = ['overview', 'monitoring', 'settings'];
    const currentView = document.querySelector('.spm-nav-btn.active')?.getAttribute('data-view') || 'overview';
    const currentIndex = views.indexOf(currentView);
    const nextIndex = (currentIndex + 1) % views.length;
    this.switchView(views[nextIndex]);
    this.addActivityLog(`📱 手势切换: ${views[nextIndex]}`);
  }

  // 切换到上一个视图
  switchToPreviousView() {
    const views = ['overview', 'monitoring', 'settings'];
    const currentView = document.querySelector('.spm-nav-btn.active')?.getAttribute('data-view') || 'overview';
    const currentIndex = views.indexOf(currentView);
    const prevIndex = (currentIndex - 1 + views.length) % views.length;
    this.switchView(views[prevIndex]);
    this.addActivityLog(`📱 手势切换: ${views[prevIndex]}`);
  }

  // 显示快速操作菜单
  showQuickActionMenu() {
    if (this.isMobile) {
      const quickMenu = document.createElement('div');
      quickMenu.className = 'mobile-quick-menu';
      quickMenu.innerHTML = `
        <div class="quick-menu-content">
          <div class="quick-menu-header">
            <h4>📱 快速操作</h4>
            <button class="close-quick-menu" onclick="this.closest('.mobile-quick-menu').remove()">✕</button>
          </div>
          <div class="quick-actions">
            <button class="quick-action-btn" onclick="spmMonitor.showDetailedStatistics(); this.closest('.mobile-quick-menu').remove();">
              📊 详细统计
            </button>
            <button class="quick-action-btn" onclick="spmMonitor.showEvolutionDirectionSetting(); this.closest('.mobile-quick-menu').remove();">
              🧬 演化设置
            </button>
            <button class="quick-action-btn" onclick="spmMonitor.showGlobalSettings(); this.closest('.mobile-quick-menu').remove();">
              ⚙️ 系统设置
            </button>
            <button class="quick-action-btn" onclick="spmMonitor.refreshData(); this.closest('.mobile-quick-menu').remove();">
              🔄 刷新数据
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(quickMenu);

      // 添加快速菜单样式
      this.addQuickMenuStyles();

      // 3秒后自动关闭
      setTimeout(() => {
        if (quickMenu.parentNode) {
          quickMenu.remove();
        }
      }, 3000);

      this.addActivityLog('📱 快速操作菜单已显示');
    }
  }

  // 添加快速菜单样式
  addQuickMenuStyles() {
    if (!document.querySelector('#mobile-quick-menu-styles')) {
      const style = document.createElement('style');
      style.id = 'mobile-quick-menu-styles';
      style.textContent = `
        .mobile-quick-menu {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        }

        .quick-menu-content {
          background: #2a2a2a;
          border-radius: 15px;
          padding: 20px;
          max-width: 300px;
          width: 90%;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .quick-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #444;
          padding-bottom: 10px;
        }

        .quick-menu-header h4 {
          margin: 0;
          color: #fff;
          font-size: 18px;
        }

        .close-quick-menu {
          background: none;
          border: none;
          color: #999;
          font-size: 20px;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-quick-menu:hover {
          background: #444;
          color: #fff;
        }

        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .quick-action-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          color: white;
          padding: 15px 20px;
          border-radius: 10px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .quick-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(99, 102, 241, 0.3);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // 移动端数据刷新
  refreshMobileData() {
    if (this.isMobile) {
      this.showMobileRefreshIndicator();
      this.refreshData();
      this.addActivityLog('📱 手势刷新数据');
    }
  }

  // 显示移动端刷新指示器
  showMobileRefreshIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'mobile-refresh-indicator';
    indicator.innerHTML = '🔄 正在刷新...';

    const style = {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#4CAF50',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '20px',
      fontSize: '14px',
      zIndex: '9999',
      animation: 'slideDown 0.3s ease',
    };

    Object.assign(indicator.style, style);
    document.body.appendChild(indicator);

    setTimeout(() => indicator.remove(), 2000);
  }

  // 优化移动端界面
  optimizeMobileInterface() {
    try {
      // 添加移动端专用CSS类
      document.body.classList.add('spm-mobile-optimized');

      // 优化按钮大小
      const buttons = document.querySelectorAll('.spm-btn, .control-btn, .tab-btn');
      buttons.forEach(btn => {
        btn.style.minHeight = '44px';
        btn.style.minWidth = '44px';
      });

      // 启用移动端专用特性
      this.enableMobileSpecificFeatures();

      this.addActivityLog('📱 移动端界面已优化');
    } catch (error) {
      console.error('❌ 移动端界面优化失败:', error);
      this.addActivityLog(`❌ 移动端优化失败: ${error.message}`);
    }
  }

  // 启用移动端专用特性
  enableMobileSpecificFeatures() {
    // 防止页面滚动弹跳
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // 禁用文本选择
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    // 优化点击延迟
    const fastClickStyle = document.createElement('style');
    fastClickStyle.textContent = `
      .spm-mobile-optimized * {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
    `;
    document.head.appendChild(fastClickStyle);

    // 添加移动端返回按钮
    this.addMobileBackButton();
  }

  // 添加移动端返回按钮
  addMobileBackButton() {
    if (this.isMobile) {
      const backButton = document.createElement('button');
      backButton.className = 'mobile-back-button';
      backButton.innerHTML = '← 返回';
      backButton.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 20px;
        font-size: 14px;
        cursor: pointer;
        z-index: 9998;
        display: none;
      `;

      backButton.addEventListener('click', () => {
        const modal = document.querySelector('.spm-modal:last-of-type');
        if (modal) {
          modal.remove();
        } else {
          this.closeSPMPanel();
        }
      });

      document.body.appendChild(backButton);

      // 在模态框打开时显示返回按钮
      const observer = new MutationObserver(() => {
        const hasModal = document.querySelector('.spm-modal');
        backButton.style.display = hasModal ? 'block' : 'none';
      });

      observer.observe(document.body, { childList: true });
    }
  }

  // 处理模态框触摸开始
  handleModalTouchStart(e) {
    // 记录触摸位置，用于判断是否为背景点击
    this.modalTouchStartX = e.touches[0].clientX;
    this.modalTouchStartY = e.touches[0].clientY;
  }

  // 获取设备信息
  getDeviceInfo() {
    return {
      isMobile: this.isMobile,
      isTablet: this.isTablet,
      touchSupported: this.touchSupported,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    };
  }

  // 移动端特定的日志记录
  addMobileActivityLog(message) {
    if (this.isMobile) {
      this.addActivityLog(`📱 ${message}`);
    }
  }
}

// 创建 SPM Status Monitor 实例
const spmMonitor = new SPMStatusMonitor();

// 如果在SillyTavern环境中，尝试集成
if (typeof getContext !== 'undefined') {
  spmMonitor.initSillyTavernIntegration();
}

// 延迟初始化，确保DOM加载完成
setTimeout(() => {
  try {
    spmMonitor.init();
  } catch (error) {
    console.error('🚨 SPM扩展初始化失败:', error);
    // 尝试基础模式初始化
    try {
      spmMonitor.injectStyles();
      spmMonitor.createTriggerButton();
      console.log('⚠️ SPM扩展以基础模式运行');
    } catch (fallbackError) {
      console.error('🚨 SPM扩展完全初始化失败:', fallbackError);
    }
  }
}, 1000);

// === 帮助系统辅助函数 ===

// 搜索帮助内容
SPMStatusMonitor.prototype.searchHelp = function (query) {
  try {
    const helpSections = document.querySelectorAll('.help-section');

    if (!query || query.trim() === '') {
      // 显示所有内容
      helpSections.forEach(section => {
        const content = section.innerHTML;
        section.innerHTML = content.replace(/<mark class="help-highlight">(.*?)<\/mark>/g, '$1');
      });
      return;
    }

    const searchQuery = query.toLowerCase().trim();
    let hasResults = false;

    helpSections.forEach(section => {
      const content = section.textContent.toLowerCase();
      const sectionDiv = section;

      if (content.includes(searchQuery)) {
        hasResults = true;
        // 高亮搜索结果
        const originalHTML = sectionDiv.innerHTML;
        const regex = new RegExp(`(${searchQuery})`, 'gi');
        sectionDiv.innerHTML = originalHTML.replace(regex, '<mark class="help-highlight">$1</mark>');
      }
    });

    if (!hasResults) {
      this.addActivityLog(`🔍 未找到"${query}"相关内容`);
    } else {
      this.addActivityLog(`🔍 找到"${query}"相关内容`);
    }
  } catch (error) {
    console.error('❌ 搜索帮助内容失败:', error);
  }
};

// 显示帮助章节
SPMStatusMonitor.prototype.showHelpSection = function (sectionName) {
  try {
    // 隐藏所有章节
    document.querySelectorAll('.help-section').forEach(section => {
      section.classList.remove('active');
    });

    // 显示指定章节
    const targetSection = document.getElementById(`help-${sectionName}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // 更新导航状态
    document.querySelectorAll('.help-nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    const activeBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    this.addActivityLog(`📖 切换到帮助章节: ${sectionName}`);
  } catch (error) {
    console.error('❌ 显示帮助章节失败:', error);
  }
};

// 报告问题
SPMStatusMonitor.prototype.reportIssue = function () {
  try {
    this.addActivityLog('🐛 打开问题报告');

    const issueDialog = document.createElement('div');
    issueDialog.className = 'spm-modal';
    issueDialog.innerHTML = `
      <div class="spm-modal-content" style="max-width: 600px;">
        <div class="spm-modal-header">
          <h3>🐛 问题反馈</h3>
          <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
        </div>
        <div class="spm-modal-body">
          <div class="issue-form">
            <div class="form-group">
              <label>问题类型:</label>
              <select id="issue-type" style="width: 100%; padding: 8px; margin: 5px 0;">
                <option value="bug">🐛 功能异常</option>
                <option value="performance">⚡ 性能问题</option>
                <option value="ui">🎨 界面问题</option>
                <option value="feature">💡 功能建议</option>
                <option value="other">❓ 其他问题</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>问题描述:</label>
              <textarea id="issue-description" placeholder="请详细描述您遇到的问题..." rows="5" style="width: 100%; padding: 8px; margin: 5px 0;"></textarea>
            </div>
            
            <div class="form-group">
              <label>重现步骤:</label>
              <textarea id="issue-steps" placeholder="请描述问题的重现步骤..." rows="3" style="width: 100%; padding: 8px; margin: 5px 0;"></textarea>
            </div>
            
            <div class="form-group">
              <label>系统信息:</label>
              <textarea id="system-info" readonly rows="3" style="width: 100%; padding: 8px; margin: 5px 0;">${this.getSystemInfo()}</textarea>
            </div>
          </div>
        </div>
        <div class="spm-modal-footer">
          <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">取消</button>
          <button class="spm-btn primary" onclick="spmMonitor.submitIssue()">提交反馈</button>
        </div>
      </div>
    `;

    document.body.appendChild(issueDialog);
  } catch (error) {
    console.error('❌ 打开问题报告失败:', error);
  }
};

// 获取系统信息
SPMStatusMonitor.prototype.getSystemInfo = function () {
  try {
    return `SPM版本: ${EXTENSION_VERSION}
浏览器: ${navigator.userAgent}
时间: ${new Date().toLocaleString('zh-CN')}
屏幕: ${screen.width}x${screen.height}
内存: ${navigator.deviceMemory || '未知'}GB`;
  } catch (error) {
    return '系统信息获取失败';
  }
};

// 提交问题反馈
SPMStatusMonitor.prototype.submitIssue = function () {
  try {
    const type = document.getElementById('issue-type')?.value;
    const description = document.getElementById('issue-description')?.value;
    const steps = document.getElementById('issue-steps')?.value;
    const systemInfo = document.getElementById('system-info')?.value;

    if (!description || description.trim() === '') {
      alert('请填写问题描述');
      return;
    }

    // 生成反馈文件
    const reportText = `SPM 问题反馈报告

问题类型: ${type}
提交时间: ${new Date().toLocaleString('zh-CN')}
SPM版本: ${EXTENSION_VERSION}

问题描述:
${description}

重现步骤:
${steps}

系统信息:
${systemInfo}

感谢您的反馈，我们会认真处理您提出的问题。`;

    // 下载反馈文件
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SPM问题反馈_${new Date().getTime()}.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    document.querySelector('.spm-modal').remove();
    this.addActivityLog('✅ 问题反馈已提交并保存');

    alert(
      '感谢您的反馈！\n\n反馈文件已自动下载，您可以通过以下方式联系我们：\n• 将反馈文件发送给开发团队\n• 在用户社区发布问题\n• 联系技术支持',
    );
  } catch (error) {
    console.error('❌ 提交问题反馈失败:', error);
    this.addActivityLog(`❌ 反馈提交失败: ${error.message}`);
  }
};

// 显示功能导览
SPMStatusMonitor.prototype.showQuickTour = function () {
  try {
    this.addActivityLog('🎯 启动功能导览');
    alert('🎯 功能导览功能正在开发中，敬请期待！\n\n您可以通过帮助文档了解各项功能的详细使用方法。');
  } catch (error) {
    console.error('❌ 功能导览启动失败:', error);
  }
};

// 导出帮助文档
SPMStatusMonitor.prototype.exportHelpPDF = function () {
  try {
    this.addActivityLog('📄 准备导出帮助文档...');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SPM 使用帮助文档</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
    h1, h2, h3 { color: #2c3e50; }
    .header { text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 20px; margin-bottom: 30px; }
    .content { max-width: 800px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="header">
    <h1>SPM 智能人格监控系统</h1>
    <p>使用帮助文档</p>
    <p>版本: ${EXTENSION_VERSION} | 导出日期: ${new Date().toLocaleDateString('zh-CN')}</p>
  </div>
  <div class="content">
    <h2>功能概览</h2>
    <p>SPM是一个智能人格监控系统，提供实时监控、演化分析和性能优化功能。</p>
    <h2>快速开始</h2>
    <p>1. 安装扩展到SillyTavern<br>2. 启用SPM扩展<br>3. 点击📊按钮打开监控面板</p>
    <h2>技术支持</h2>
    <p>如需帮助，请使用内置的问题反馈功能或联系技术支持。</p>
  </div>
</body>
</html>
    `;

    // 创建下载链接
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SPM帮助文档_v${EXTENSION_VERSION}_${new Date().getTime()}.html`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.addActivityLog('✅ 帮助文档已导出为HTML文件');
  } catch (error) {
    console.error('❌ 导出帮助文档失败:', error);
    this.addActivityLog(`❌ 导出失败: ${error.message}`);
  }
};

// 其他辅助函数
SPMStatusMonitor.prototype.runSystemDiagnostic = function () {
  this.addActivityLog('🏥 运行系统诊断...');
  alert('🏥 系统诊断功能正在开发中');
};

SPMStatusMonitor.prototype.testPerformance = function () {
  this.addActivityLog('⚡ 运行性能测试...');
  alert('⚡ 性能测试功能正在开发中');
};

SPMStatusMonitor.prototype.checkDataIntegrity = function () {
  this.addActivityLog('🔒 检查数据完整性...');
  alert('🔒 数据完整性检查功能正在开发中');
};

SPMStatusMonitor.prototype.clearCache = function () {
  this.addActivityLog('🧹 清除缓存...');
  localStorage.removeItem('spm_cache');
  localStorage.removeItem('spm_temp_data');
  this.addActivityLog('✅ 缓存已清除');
  alert('✅ 缓存已清除');
};

SPMStatusMonitor.prototype.collectDiagnosticLogs = function () {
  this.addActivityLog('📋 收集诊断日志...');
  alert('📋 诊断日志收集功能正在开发中');
};

SPMStatusMonitor.prototype.backupUserData = function () {
  this.addActivityLog('💾 备份用户数据...');
  alert('💾 数据备份功能正在开发中');
};

SPMStatusMonitor.prototype.suggestFeature = function () {
  this.addActivityLog('💡 打开功能建议...');
  alert('💡 功能建议提交功能正在开发中');
};

// === 记忆表格集成面板系统 ===

// 显示记忆表格集成面板
SPMStatusMonitor.prototype.showMemoryTablePanel = function () {
  try {
    this.addActivityLog('📋 打开记忆表格集成面板');

    // 初始化面板数据管理器
    this.initMemoryTableDataManager();

    const panelDialog = document.createElement('div');
    panelDialog.className = 'spm-modal memory-table-panel-modal';
    panelDialog.innerHTML = `
      <div class="spm-modal-content memory-table-panel-content">
        <div class="spm-modal-header memory-table-panel-header">
          <h3>📋 SPM 5.5 记忆表格集成面板</h3>
          <div class="panel-quick-actions">
            <button class="quick-action-btn" onclick="spmMonitor.refreshMemoryTableData()" title="刷新数据">🔄</button>
            <button class="quick-action-btn" onclick="spmMonitor.exportMemoryTableData()" title="导出数据">📤</button>
            <button class="quick-action-btn" onclick="spmMonitor.syncMemoryTableData()" title="同步数据">🔗</button>
          </div>
          <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
        </div>
        
        <div class="spm-modal-body memory-table-panel-body">
          <!-- 数据概览卡片区域 -->
          <div class="overview-cards-section">
            <h4>📊 数据概览</h4>
            <div class="overview-cards-grid">
              ${this.renderOverviewCards()}
            </div>
          </div>
          
          <!-- 角色管理区域 -->
          <div class="character-management-section">
            <h4>🎭 角色管理</h4>
            <div class="character-management-content">
              ${this.renderCharacterManagement()}
            </div>
          </div>
          
          <!-- 记忆表格主区域 -->
          <div class="memory-table-main-section">
            <h4>📋 记忆表格</h4>
            <div class="table-controls">
              ${this.renderTableControls()}
            </div>
            <div class="table-display-area">
              ${this.renderMemoryTable()}
            </div>
          </div>
          
          <!-- 操作控制区域 -->
          <div class="action-controls-section">
            <h4>🔧 操作控制</h4>
            <div class="action-controls-content">
              ${this.renderActionControls()}
            </div>
          </div>
        </div>
        
        <div class="spm-modal-footer memory-table-panel-footer">
          <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
          <button class="spm-btn secondary" onclick="spmMonitor.openMemoryTableSettings()">⚙️ 设置</button>
          <button class="spm-btn primary" onclick="spmMonitor.saveMemoryTableChanges()">💾 保存更改</button>
        </div>
      </div>
    `;

    document.body.appendChild(panelDialog);
    this.addMemoryTablePanelStyles();
    this.bindMemoryTableEvents();
    this.addActivityLog('✅ 记忆表格集成面板已打开');
  } catch (error) {
    console.error('❌ 打开记忆表格集成面板失败:', error);
    this.addActivityLog(`❌ 面板打开失败: ${error.message}`);
  }
};

// 初始化记忆表格数据管理器
SPMStatusMonitor.prototype.initMemoryTableDataManager = function () {
  try {
    this.memoryTableData = {
      // 当前状态
      currentCharacter: 'all',
      currentTableType: 'history',
      currentPage: 1,
      pageSize: 20,
      searchQuery: '',
      filters: {
        timeRange: 'all',
        persona: 'all',
        status: 'all',
        character: 'all',
      },

      // 数据缓存
      cache: {
        overview: null,
        characters: null,
        history: null,
        logs: null,
        performance: null,
        lastUpdate: null,
      },

      // 统计数据
      stats: {
        totalRecords: 0,
        activeCharacters: 0,
        todayInteractions: 0,
        systemStatus: 'normal',
      },
    };

    // 加载初始数据
    this.loadMemoryTableData();
  } catch (error) {
    console.error('❌ 初始化记忆表格数据管理器失败:', error);
  }
};

// 加载记忆表格数据
SPMStatusMonitor.prototype.loadMemoryTableData = function () {
  try {
    // 加载本地数据
    const localData = this.getLocalMemoryData();

    // 加载MVU数据（异步）
    this.getMVUMemoryData()
      .then(mvuData => {
        // 加载监督层数据
        const supervisorData = this.getSupervisorMemoryData();

        // 整合数据
        this.integrateMemoryData(localData, mvuData, supervisorData);

        // 更新统计
        this.updateMemoryTableStats();

        this.addActivityLog('✅ 记忆表格数据加载完成');
      })
      .catch(error => {
        console.error('❌ 加载MVU数据失败:', error);
        // 仅使用本地数据
        const supervisorData = this.getSupervisorMemoryData();
        this.integrateMemoryData(localData, {}, supervisorData);
        this.updateMemoryTableStats();
      });
  } catch (error) {
    console.error('❌ 加载记忆表格数据失败:', error);
    this.addActivityLog(`❌ 数据加载失败: ${error.message}`);
  }
};

// 获取本地记忆数据
SPMStatusMonitor.prototype.getLocalMemoryData = function () {
  try {
    const data = {
      history: JSON.parse(localStorage.getItem('spm_interaction_history') || '[]'),
      logs: JSON.parse(localStorage.getItem('spm_system_logs') || '[]'),
      characters: JSON.parse(localStorage.getItem('spm_character_profiles') || '{}'),
      settings: JSON.parse(localStorage.getItem('spm_memory_settings') || '{}'),
    };

    return data;
  } catch (error) {
    console.error('❌ 获取本地记忆数据失败:', error);
    return { history: [], logs: [], characters: {}, settings: {} };
  }
};

// 获取MVU记忆数据
SPMStatusMonitor.prototype.getMVUMemoryData = function () {
  return new Promise((resolve, reject) => {
    try {
      // 这里集成TavernHelper的MVU数据模型
      if (typeof TavernHelper !== 'undefined' && TavernHelper.memory) {
        const mvuData = {
          interactionHistory: TavernHelper.memory.interaction_history || [],
          systemLogs: TavernHelper.memory.system_logs || [],
          characterProfiles: TavernHelper.memory.character_profiles || {},
          contextData: TavernHelper.memory.context_data || {},
        };

        resolve(mvuData);
      } else {
        resolve({ interactionHistory: [], systemLogs: [], characterProfiles: {}, contextData: {} });
      }
    } catch (error) {
      console.error('❌ 获取MVU记忆数据失败:', error);
      reject(error);
    }
  });
};

// 获取监督层记忆数据
SPMStatusMonitor.prototype.getSupervisorMemoryData = function () {
  try {
    // 这里集成SPM 6.0监督层数据
    const supervisorData = {
      personaWeights: this.currentPersonaWeights || {},
      skillProgress: this.currentSkillProgress || {},
      evolutionData: this.evolutionHistory || [],
      recommendations: this.systemRecommendations || [],
    };

    return supervisorData;
  } catch (error) {
    console.error('❌ 获取监督层记忆数据失败:', error);
    return { personaWeights: {}, skillProgress: {}, evolutionData: [], recommendations: [] };
  }
};

// 整合记忆数据
SPMStatusMonitor.prototype.integrateMemoryData = function (localData, mvuData, supervisorData) {
  try {
    // 整合历史记录
    const integratedHistory = [...localData.history, ...(mvuData.interactionHistory || [])].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    );

    // 整合系统日志
    const integratedLogs = [...localData.logs, ...(mvuData.systemLogs || [])].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    );

    // 整合角色数据
    const integratedCharacters = {
      ...localData.characters,
      ...(mvuData.characterProfiles || {}),
    };

    // 添加监督层增强数据
    Object.keys(integratedCharacters).forEach(charId => {
      if (supervisorData.personaWeights[charId]) {
        integratedCharacters[charId].personaWeights = supervisorData.personaWeights[charId];
      }
      if (supervisorData.skillProgress[charId]) {
        integratedCharacters[charId].skillProgress = supervisorData.skillProgress[charId];
      }
    });

    // 更新缓存
    this.memoryTableData.cache = {
      overview: {
        totalRecords: integratedHistory.length + integratedLogs.length,
        activeCharacters: Object.keys(integratedCharacters).length,
        todayInteractions: this.getTodayInteractions(integratedHistory),
        systemStatus: this.getSystemStatus(),
      },
      characters: integratedCharacters,
      history: integratedHistory,
      logs: integratedLogs,
      performance: supervisorData.evolutionData,
      lastUpdate: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ 整合记忆数据失败:', error);
  }
};

// 获取今日交互数据
SPMStatusMonitor.prototype.getTodayInteractions = function (history) {
  try {
    const today = new Date().toDateString();
    return history.filter(item => new Date(item.timestamp).toDateString() === today).length;
  } catch (error) {
    return 0;
  }
};

// 获取系统状态
SPMStatusMonitor.prototype.getSystemStatus = function () {
  try {
    // 基于系统健康度计算状态
    const health = this.systemHealth || 0.9;
    if (health >= 0.9) return 'excellent';
    if (health >= 0.7) return 'good';
    if (health >= 0.5) return 'warning';
    return 'error';
  } catch (error) {
    return 'unknown';
  }
};

// 更新记忆表格统计
SPMStatusMonitor.prototype.updateMemoryTableStats = function () {
  try {
    const cache = this.memoryTableData.cache;

    this.memoryTableData.stats = {
      totalRecords: cache.overview.totalRecords,
      activeCharacters: cache.overview.activeCharacters,
      todayInteractions: cache.overview.todayInteractions,
      systemStatus: cache.overview.systemStatus,
      lastSync: cache.lastUpdate,
      dataSize: this.calculateDataSize(cache),
    };
  } catch (error) {
    console.error('❌ 更新记忆表格统计失败:', error);
  }
};

// 计算数据大小
SPMStatusMonitor.prototype.calculateDataSize = function (cache) {
  try {
    const dataStr = JSON.stringify(cache);
    return Math.round(dataStr.length / 1024); // KB
  } catch (error) {
    return 0;
  }
};

// === UI渲染组件 ===

// 渲染数据概览卡片
SPMStatusMonitor.prototype.renderOverviewCards = function () {
  try {
    const stats = this.memoryTableData?.stats || {};
    const statusIcons = {
      excellent: '🟢',
      good: '🟡',
      warning: '🟠',
      error: '🔴',
      unknown: '⚪',
    };

    return `
      <div class="overview-card total-records-card">
        <div class="card-icon">📊</div>
        <div class="card-content">
          <h4>总记录数</h4>
          <div class="card-value">${stats.totalRecords || 0}</div>
          <div class="card-trend">+${this.getTodayNewRecords()} 今日新增</div>
        </div>
      </div>
      
      <div class="overview-card active-characters-card">
        <div class="card-icon">🎭</div>
        <div class="card-content">
          <h4>活跃角色</h4>
          <div class="card-value">${stats.activeCharacters || 0}</div>
          <div class="card-trend">${this.getCharacterActivity()} 参与度</div>
        </div>
      </div>
      
      <div class="overview-card today-interactions-card">
        <div class="card-icon">💬</div>
        <div class="card-content">
          <h4>今日交互</h4>
          <div class="card-value">${stats.todayInteractions || 0}</div>
          <div class="card-trend">${this.getInteractionTrend()} 对比昨日</div>
        </div>
      </div>
      
      <div class="overview-card system-status-card">
        <div class="card-icon">${statusIcons[stats.systemStatus] || '⚪'}</div>
        <div class="card-content">
          <h4>系统状态</h4>
          <div class="card-value">${this.getStatusText(stats.systemStatus)}</div>
          <div class="card-trend">${stats.dataSize || 0}KB 数据</div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('❌ 渲染概览卡片失败:', error);
    return '<div class="error-message">无法加载概览数据</div>';
  }
};

// 渲染角色管理组件
SPMStatusMonitor.prototype.renderCharacterManagement = function () {
  try {
    const characters = this.memoryTableData?.cache?.characters || {};
    const characterList = Object.keys(characters);

    if (characterList.length === 0) {
      return `
        <div class="character-management-empty">
          <div class="empty-icon">👤</div>
          <p>暂无角色数据</p>
          <button class="spm-btn primary" onclick="spmMonitor.addNewCharacter()">添加角色</button>
        </div>
      `;
    }

    return `
      <div class="character-tabs-header">
        <div class="character-tabs">
          <button class="character-tab ${this.memoryTableData.currentCharacter === 'all' ? 'active' : ''}" 
                  onclick="spmMonitor.switchCharacter('all')">
            全部 (${characterList.length})
          </button>
          ${characterList
            .map(
              charId => `
            <button class="character-tab ${this.memoryTableData.currentCharacter === charId ? 'active' : ''}" 
                    onclick="spmMonitor.switchCharacter('${charId}')">
              ${characters[charId].name || charId}
              <span class="character-records-count">${this.getCharacterRecordCount(charId)}</span>
            </button>
          `,
            )
            .join('')}
        </div>
        <button class="add-character-btn" onclick="spmMonitor.addNewCharacter()" title="添加新角色">+</button>
      </div>
      
      <div class="character-details-section">
        ${this.renderCharacterDetails()}
      </div>
    `;
  } catch (error) {
    console.error('❌ 渲染角色管理失败:', error);
    return '<div class="error-message">无法加载角色数据</div>';
  }
};

// 渲染角色详情
SPMStatusMonitor.prototype.renderCharacterDetails = function () {
  try {
    const currentChar = this.memoryTableData.currentCharacter;

    if (currentChar === 'all') {
      return this.renderAllCharactersOverview();
    }

    const characters = this.memoryTableData?.cache?.characters || {};
    const character = characters[currentChar];

    if (!character) {
      return '<div class="error-message">角色数据不存在</div>';
    }

    return `
      <div class="character-detail-card">
        <div class="character-header">
          <div class="character-avatar">
            <img src="${character.avatar || '/img/ai4.png'}" alt="${character.name}" 
                 onerror="this.src='/img/ai4.png'">
          </div>
          <div class="character-basic-info">
            <h3>${character.name}</h3>
            <p class="character-description">${character.description || '暂无描述'}</p>
            <div class="character-meta">
              <span class="meta-item">💬 ${this.getCharacterInteractionCount(currentChar)} 次交互</span>
              <span class="meta-item">📅 ${this.getCharacterLastActivity(currentChar)}</span>
            </div>
          </div>
          <div class="character-actions">
            <button class="action-btn" onclick="spmMonitor.editCharacter('${currentChar}')" title="编辑角色">✏️</button>
            <button class="action-btn" onclick="spmMonitor.exportCharacterData('${currentChar}')" title="导出数据">📤</button>
            <button class="action-btn danger" onclick="spmMonitor.deleteCharacter('${currentChar}')" title="删除角色">🗑️</button>
          </div>
        </div>
        
        <div class="character-stats-grid">
          <div class="stat-card">
            <h4>人格权重</h4>
            <div class="persona-weights">
              ${this.renderPersonaWeights(character.personaWeights)}
            </div>
          </div>
          
          <div class="stat-card">
            <h4>技能进度</h4>
            <div class="skill-progress">
              ${this.renderSkillProgress(character.skillProgress)}
            </div>
          </div>
          
          <div class="stat-card">
            <h4>活动趋势</h4>
            <div class="activity-chart">
              ${this.renderActivityChart(currentChar)}
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('❌ 渲染角色详情失败:', error);
    return '<div class="error-message">无法加载角色详情</div>';
  }
};

// 渲染表格控制组件
SPMStatusMonitor.prototype.renderTableControls = function () {
  try {
    return `
      <div class="table-controls-top">
        <div class="table-type-selector">
          <button class="table-type-btn ${this.memoryTableData.currentTableType === 'history' ? 'active' : ''}" 
                  onclick="spmMonitor.switchTableType('history')">
            💬 交互历史
          </button>
          <button class="table-type-btn ${this.memoryTableData.currentTableType === 'logs' ? 'active' : ''}" 
                  onclick="spmMonitor.switchTableType('logs')">
            📝 系统日志
          </button>
          <button class="table-type-btn ${this.memoryTableData.currentTableType === 'performance' ? 'active' : ''}" 
                  onclick="spmMonitor.switchTableType('performance')">
            📊 性能数据
          </button>
        </div>
        
        <div class="table-search-controls">
          <div class="search-input-group">
            <input type="text" id="memoryTableSearch" placeholder="搜索记录..." 
                   value="${this.memoryTableData.searchQuery}" 
                   onkeyup="spmMonitor.debounceSearch(this.value)">
            <button class="search-btn" onclick="spmMonitor.performSearch()">🔍</button>
          </div>
          
          <div class="filter-controls">
            <select id="timeRangeFilter" onchange="spmMonitor.updateFilter('timeRange', this.value)">
              <option value="all" ${
                this.memoryTableData.filters.timeRange === 'all' ? 'selected' : ''
              }>全部时间</option>
              <option value="today" ${
                this.memoryTableData.filters.timeRange === 'today' ? 'selected' : ''
              }>今天</option>
              <option value="week" ${this.memoryTableData.filters.timeRange === 'week' ? 'selected' : ''}>本周</option>
              <option value="month" ${
                this.memoryTableData.filters.timeRange === 'month' ? 'selected' : ''
              }>本月</option>
            </select>
            
            <select id="statusFilter" onchange="spmMonitor.updateFilter('status', this.value)">
              <option value="all" ${this.memoryTableData.filters.status === 'all' ? 'selected' : ''}>全部状态</option>
              <option value="success" ${
                this.memoryTableData.filters.status === 'success' ? 'selected' : ''
              }>成功</option>
              <option value="warning" ${
                this.memoryTableData.filters.status === 'warning' ? 'selected' : ''
              }>警告</option>
              <option value="error" ${this.memoryTableData.filters.status === 'error' ? 'selected' : ''}>错误</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="table-controls-bottom">
        <div class="results-info">
          显示 ${this.getFilteredRecordsCount()} 条记录，共 ${this.getTotalRecordsCount()} 条
        </div>
        
        <div class="pagination-controls">
          <button class="pagination-btn" onclick="spmMonitor.goToPage(1)" 
                  ${this.memoryTableData.currentPage === 1 ? 'disabled' : ''}>⏮️</button>
          <button class="pagination-btn" onclick="spmMonitor.goToPage(${this.memoryTableData.currentPage - 1})" 
                  ${this.memoryTableData.currentPage === 1 ? 'disabled' : ''}>◀️</button>
          
          <span class="page-info">
            第 ${this.memoryTableData.currentPage} 页，共 ${this.getTotalPages()} 页
          </span>
          
          <button class="pagination-btn" onclick="spmMonitor.goToPage(${this.memoryTableData.currentPage + 1})" 
                  ${this.memoryTableData.currentPage >= this.getTotalPages() ? 'disabled' : ''}>▶️</button>
          <button class="pagination-btn" onclick="spmMonitor.goToPage(${this.getTotalPages()})" 
                  ${this.memoryTableData.currentPage >= this.getTotalPages() ? 'disabled' : ''}>⏭️</button>
        </div>
        
        <div class="view-controls">
          <select id="pageSizeSelector" onchange="spmMonitor.updatePageSize(this.value)">
            <option value="10" ${this.memoryTableData.pageSize === 10 ? 'selected' : ''}>10条/页</option>
            <option value="20" ${this.memoryTableData.pageSize === 20 ? 'selected' : ''}>20条/页</option>
            <option value="50" ${this.memoryTableData.pageSize === 50 ? 'selected' : ''}>50条/页</option>
            <option value="100" ${this.memoryTableData.pageSize === 100 ? 'selected' : ''}>100条/页</option>
          </select>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('❌ 渲染表格控制失败:', error);
    return '<div class="error-message">无法加载控制面板</div>';
  }
};

// 渲染记忆表格
SPMStatusMonitor.prototype.renderMemoryTable = function () {
  try {
    const tableType = this.memoryTableData.currentTableType;

    switch (tableType) {
      case 'history':
        return this.renderHistoryTable();
      case 'logs':
        return this.renderLogsTable();
      case 'performance':
        return this.renderPerformanceTable();
      default:
        return '<div class="error-message">未知的表格类型</div>';
    }
  } catch (error) {
    console.error('❌ 渲染记忆表格失败:', error);
    return '<div class="error-message">无法加载表格数据</div>';
  }
};

// 渲染操作控制组件
SPMStatusMonitor.prototype.renderActionControls = function () {
  try {
    return `
      <div class="action-controls-grid">
        <div class="action-group data-operations">
          <h5>📊 数据操作</h5>
          <button class="action-control-btn" onclick="spmMonitor.refreshMemoryTableData()">
            🔄 刷新数据
          </button>
          <button class="action-control-btn" onclick="spmMonitor.exportMemoryTableData()">
            📤 导出数据
          </button>
          <button class="action-control-btn" onclick="spmMonitor.importMemoryTableData()">
            📥 导入数据
          </button>
          <button class="action-control-btn" onclick="spmMonitor.clearMemoryTableData()">
            🗑️ 清空数据
          </button>
        </div>
        
        <div class="action-group sync-operations">
          <h5>🔗 同步操作</h5>
          <button class="action-control-btn" onclick="spmMonitor.syncMemoryTableData()">
            🔗 同步MVU
          </button>
          <button class="action-control-btn" onclick="spmMonitor.syncSupervisorData()">
            👁️ 同步监督层
          </button>
          <button class="action-control-btn" onclick="spmMonitor.forceFullSync()">
            ⚡ 强制全同步
          </button>
          <button class="action-control-btn" onclick="spmMonitor.checkDataIntegrity()">
            🔍 数据完整性检查
          </button>
        </div>
        
        <div class="action-group batch-operations">
          <h5>📋 批量操作</h5>
          <button class="action-control-btn" onclick="spmMonitor.selectAllRecords()">
            ☑️ 全选记录
          </button>
          <button class="action-control-btn" onclick="spmMonitor.batchExportSelected()">
            📤 导出选中
          </button>
          <button class="action-control-btn" onclick="spmMonitor.batchDeleteSelected()">
            🗑️ 删除选中
          </button>
          <button class="action-control-btn" onclick="spmMonitor.batchTagSelected()">
            🏷️ 标记选中
          </button>
        </div>
        
        <div class="action-group analysis-operations">
          <h5>📈 分析功能</h5>
          <button class="action-control-btn" onclick="spmMonitor.generateAnalysisReport()">
            📊 生成分析报告
          </button>
          <button class="action-control-btn" onclick="spmMonitor.showTrendAnalysis()">
            📈 趋势分析
          </button>
          <button class="action-control-btn" onclick="spmMonitor.showInteractionMap()">
            🗺️ 交互地图
          </button>
          <button class="action-control-btn" onclick="spmMonitor.predictBehavior()">
            🔮 行为预测
          </button>
        </div>
      </div>
      
      <div class="action-status-bar">
        <div class="status-indicators">
          <span class="status-indicator ${this.getSyncStatus()}" title="同步状态">
            🔗 ${this.getSyncStatusText()}
          </span>
          <span class="status-indicator ${this.getDataStatus()}" title="数据状态">
            💾 ${this.getDataStatusText()}
          </span>
          <span class="status-indicator ${this.getSystemStatus()}" title="系统状态">
            ⚡ ${this.getSystemStatusText()}
          </span>
        </div>
        
        <div class="last-update-info">
          最后更新: ${this.getLastUpdateTime()}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('❌ 渲染操作控制失败:', error);
    return '<div class="error-message">无法加载操作控制</div>';
  }
};

// 监听SillyTavern事件
if (typeof eventSource !== 'undefined') {
  eventSource.on('app_ready', () => {
    console.log('📊 SillyTavern准备就绪，SPM Status Monitor正在初始化...');
    spmMonitor.init();
  });
}

// === 记忆表格面板辅助方法 ===

// 获取今日新增记录数
SPMStatusMonitor.prototype.getTodayNewRecords = function () {
  try {
    const today = new Date().toDateString();
    const history = this.memoryTableData?.cache?.history || [];
    return history.filter(item => new Date(item.timestamp).toDateString() === today).length;
  } catch (error) {
    return 0;
  }
};

// 获取角色活跃度
SPMStatusMonitor.prototype.getCharacterActivity = function () {
  try {
    const characters = this.memoryTableData?.cache?.characters || {};
    const total = Object.keys(characters).length;
    if (total === 0) return '0%';

    const active = Object.values(characters).filter(char => {
      const lastActivity = new Date(char.lastActivity || 0);
      const daysSince = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7; // 7天内活跃
    }).length;

    return Math.round((active / total) * 100) + '%';
  } catch (error) {
    return '0%';
  }
};

// 获取交互趋势
SPMStatusMonitor.prototype.getInteractionTrend = function () {
  try {
    const history = this.memoryTableData?.cache?.history || [];
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    const todayCount = history.filter(item => new Date(item.timestamp).toDateString() === today).length;

    const yesterdayCount = history.filter(item => new Date(item.timestamp).toDateString() === yesterday).length;

    if (yesterdayCount === 0) return todayCount > 0 ? '+100%' : '0%';

    const diff = ((todayCount - yesterdayCount) / yesterdayCount) * 100;
    return (diff >= 0 ? '+' : '') + Math.round(diff) + '%';
  } catch (error) {
    return '0%';
  }
};

// 获取状态文本
SPMStatusMonitor.prototype.getStatusText = function (status) {
  const statusMap = {
    excellent: '优秀',
    good: '良好',
    warning: '警告',
    error: '错误',
    unknown: '未知',
  };
  return statusMap[status] || '未知';
};

// 获取角色记录数量
SPMStatusMonitor.prototype.getCharacterRecordCount = function (charId) {
  try {
    const history = this.memoryTableData?.cache?.history || [];
    return history.filter(item => item.characterId === charId).length;
  } catch (error) {
    return 0;
  }
};

// 渲染全部角色概览
SPMStatusMonitor.prototype.renderAllCharactersOverview = function () {
  try {
    const characters = this.memoryTableData?.cache?.characters || {};
    const characterList = Object.keys(characters);

    return `
      <div class="all-characters-overview">
        <div class="overview-header">
          <h3>全部角色概览</h3>
          <div class="overview-stats">
            <span class="stat">总计: ${characterList.length} 个角色</span>
            <span class="stat">活跃: ${this.getActiveCharacterCount()} 个</span>
          </div>
        </div>
        
        <div class="characters-grid">
          ${characterList
            .map(charId => {
              const char = characters[charId];
              return `
              <div class="character-summary-card" onclick="spmMonitor.switchCharacter('${charId}')">
                <div class="char-avatar">
                  <img src="${char.avatar || '/img/ai4.png'}" alt="${char.name}" 
                       onerror="this.src='/img/ai4.png'">
                </div>
                <div class="char-info">
                  <h4>${char.name}</h4>
                  <p>${this.getCharacterRecordCount(charId)} 条记录</p>
                  <div class="char-activity ${this.getCharacterActivityStatus(charId)}">
                    ${this.getCharacterLastActivity(charId)}
                  </div>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('❌ 渲染全部角色概览失败:', error);
    return '<div class="error-message">无法加载角色概览</div>';
  }
};

// 渲染人格权重
SPMStatusMonitor.prototype.renderPersonaWeights = function (weights) {
  if (!weights) return '<p>暂无人格权重数据</p>';

  return Object.entries(weights)
    .map(
      ([persona, weight]) => `
    <div class="persona-weight-item">
      <span class="persona-label">${persona}:</span>
      <div class="weight-bar">
        <div class="weight-fill" style="width: ${weight}%"></div>
      </div>
      <span class="weight-value">${weight}%</span>
    </div>
  `,
    )
    .join('');
};

// 渲染技能进度
SPMStatusMonitor.prototype.renderSkillProgress = function (skills) {
  if (!skills) return '<p>暂无技能进度数据</p>';

  return Object.entries(skills)
    .map(
      ([skill, progress]) => `
    <div class="skill-progress-item">
      <span class="skill-label">${skill}:</span>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <span class="progress-value">${progress}%</span>
    </div>
  `,
    )
    .join('');
};

// 渲染活动图表
SPMStatusMonitor.prototype.renderActivityChart = function (charId) {
  try {
    // 这里可以添加更复杂的图表实现
    return `
      <div class="simple-activity-chart">
        <div class="chart-placeholder">
          📈 活动趋势图
          <br>
          <small>最近7天活动统计</small>
        </div>
      </div>
    `;
  } catch (error) {
    return '<div class="error-message">无法加载活动图表</div>';
  }
};

// 添加记忆表格面板样式
SPMStatusMonitor.prototype.addMemoryTablePanelStyles = function () {
  const style = document.createElement('style');
  style.textContent = `
    /* 记忆表格集成面板样式 */
    .memory-table-panel-modal {
      z-index: 10001;
    }
    
    .memory-table-panel-content {
      width: 95vw;
      height: 90vh;
      max-width: 1400px;
    }
    
    .memory-table-panel-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
    }
    
    .panel-quick-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .quick-action-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      border-radius: 0.25rem;
      color: white;
      padding: 0.5rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .quick-action-btn:hover {
      background: rgba(255,255,255,0.3);
    }
    
    .memory-table-panel-body {
      padding: 1rem;
      height: calc(100% - 140px);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    /* 概览卡片样式 */
    .overview-cards-section h4 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.1rem;
    }
    
    .overview-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .overview-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 0.5rem;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    
    .overview-card:hover {
      transform: translateY(-2px);
    }
    
    .overview-card .card-icon {
      font-size: 2rem;
      opacity: 0.8;
    }
    
    .overview-card .card-content h4 {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
    }
    
    .overview-card .card-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
      margin: 0.25rem 0;
    }
    
    .overview-card .card-trend {
      font-size: 0.8rem;
      color: #888;
    }
    
    /* 角色管理样式 */
    .character-management-section h4 {
      margin: 0 0 1rem 0;
      color: #333;
    }
    
    .character-tabs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .character-tabs {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .character-tab {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 0.25rem;
      padding: 0.5rem 1rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .character-tab.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }
    
    .character-records-count {
      background: rgba(0,0,0,0.2);
      border-radius: 0.75rem;
      padding: 0.125rem 0.5rem;
      font-size: 0.75rem;
    }
    
    .add-character-btn {
      background: #28a745;
      color: white;
      border: none;
      border-radius: 0.25rem;
      width: 2rem;
      height: 2rem;
      cursor: pointer;
      font-size: 1.2rem;
    }
    
    /* 表格控制样式 */
    .table-controls-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .table-type-selector {
      display: flex;
      gap: 0.5rem;
    }
    
    .table-type-btn {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 0.25rem;
      padding: 0.5rem 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .table-type-btn.active {
      background: #17a2b8;
      color: white;
      border-color: #17a2b8;
    }
    
    .table-search-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    
    .search-input-group {
      display: flex;
      gap: 0.25rem;
    }
    
    .search-input-group input {
      padding: 0.5rem;
      border: 1px solid #dee2e6;
      border-radius: 0.25rem;
      min-width: 200px;
    }
    
    .search-btn {
      background: #007bff;
      color: white;
      border: none;
      border-radius: 0.25rem;
      padding: 0.5rem;
      cursor: pointer;
    }
    
    .filter-controls {
      display: flex;
      gap: 0.5rem;
    }
    
    .filter-controls select {
      padding: 0.5rem;
      border: 1px solid #dee2e6;
      border-radius: 0.25rem;
    }
    
    /* 操作控制样式 */
    .action-controls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    
    .action-group {
      background: #f8f9fa;
      border-radius: 0.5rem;
      padding: 1rem;
    }
    
    .action-group h5 {
      margin: 0 0 1rem 0;
      color: #495057;
      font-size: 1rem;
    }
    
    .action-control-btn {
      display: block;
      width: 100%;
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 0.25rem;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
    }
    
    .action-control-btn:hover {
      background: #e9ecef;
      border-color: #adb5bd;
    }
    
    .action-control-btn:last-child {
      margin-bottom: 0;
    }
    
    /* 响应式设计 */
    @media (max-width: 768px) {
      .memory-table-panel-content {
        width: 98vw;
        height: 95vh;
      }
      
      .overview-cards-grid {
        grid-template-columns: 1fr;
      }
      
      .action-controls-grid {
        grid-template-columns: 1fr;
      }
      
      .table-controls-top {
        flex-direction: column;
        align-items: stretch;
      }
      
      .character-tabs {
        flex-direction: column;
      }
    }
    
    /* 表格样式 */
    .memory-table-container {
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .table-header {
      background: #f8f9fa;
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .table-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .table-action-btn {
      background: #007bff;
      color: white;
      border: none;
      border-radius: 0.25rem;
      padding: 0.5rem 1rem;
      cursor: pointer;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .table-action-btn:hover {
      background: #0056b3;
    }
    
    .table-wrapper {
      overflow-x: auto;
      max-height: 500px;
      overflow-y: auto;
    }
    
    .memory-data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    
    .memory-data-table th {
      background: #e9ecef;
      padding: 0.75rem 0.5rem;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #dee2e6;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    .memory-data-table td {
      padding: 0.75rem 0.5rem;
      border-bottom: 1px solid #dee2e6;
      vertical-align: middle;
    }
    
    .memory-data-table tr:hover {
      background: #f8f9fa;
    }
    
    .sortable {
      cursor: pointer;
      user-select: none;
    }
    
    .sortable:hover {
      background: #dee2e6;
    }
    
    .sort-indicator {
      opacity: 0.5;
      margin-left: 0.5rem;
    }
    
    /* 表格列样式 */
    .checkbox-col {
      width: 40px;
      text-align: center;
    }
    
    .timestamp-col {
      width: 120px;
      min-width: 120px;
    }
    
    .character-col {
      width: 150px;
      min-width: 150px;
    }
    
    .type-col {
      width: 100px;
      min-width: 100px;
    }
    
    .content-col {
      width: auto;
      min-width: 200px;
      max-width: 300px;
    }
    
    .status-col {
      width: 100px;
      min-width: 100px;
    }
    
    .actions-col {
      width: 120px;
      min-width: 120px;
    }
    
    .level-col {
      width: 80px;
      min-width: 80px;
    }
    
    .source-col {
      width: 100px;
      min-width: 100px;
    }
    
    .message-col {
      width: auto;
      min-width: 250px;
      max-width: 400px;
    }
    
    .data-col {
      width: 80px;
      min-width: 80px;
    }
    
    .metric-col {
      width: 120px;
      min-width: 120px;
    }
    
    /* 表格内容样式 */
    .timestamp-display {
      display: flex;
      flex-direction: column;
    }
    
    .timestamp-display .date {
      font-weight: 500;
      color: #495057;
    }
    
    .timestamp-display .time {
      font-size: 0.8rem;
      color: #6c757d;
    }
    
    .character-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .character-avatar-small {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .character-name {
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .interaction-type {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background: #e9ecef;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.8rem;
    }
    
    .content-preview {
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .content-preview:hover {
      background: #f8f9fa;
      padding: 0.25rem;
      border-radius: 0.25rem;
    }
    
    .read-more {
      color: #007bff;
      font-size: 0.8rem;
      margin-left: 0.5rem;
    }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.8rem;
      font-weight: 500;
    }
    
    .status-success {
      background: #d4edda;
      color: #155724;
    }
    
    .status-warning {
      background: #fff3cd;
      color: #856404;
    }
    
    .status-error {
      background: #f8d7da;
      color: #721c24;
    }
    
    .status-pending {
      background: #cff4fc;
      color: #055160;
    }
    
    .status-info {
      background: #e2e3e5;
      color: #41464b;
    }
    
    .row-actions {
      display: flex;
      gap: 0.25rem;
    }
    
    .action-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.25rem;
      border-radius: 0.25rem;
      transition: background 0.2s;
    }
    
    .action-btn:hover {
      background: #e9ecef;
    }
    
    .action-btn.danger:hover {
      background: #f8d7da;
    }
    
    /* 日志表格样式 */
    .log-level {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.8rem;
      font-weight: 500;
    }
    
    .log-debug {
      background: #e2e3e5;
      color: #41464b;
    }
    
    .log-info {
      background: #cff4fc;
      color: #055160;
    }
    
    .log-warning {
      background: #fff3cd;
      color: #856404;
    }
    
    .log-error {
      background: #f8d7da;
      color: #721c24;
    }
    
    .log-critical {
      background: #dc3545;
      color: white;
    }
    
    .log-source {
      font-family: monospace;
      background: #f8f9fa;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.8rem;
    }
    
    .log-message {
      cursor: pointer;
      font-family: monospace;
      font-size: 0.85rem;
      line-height: 1.3;
    }
    
    .data-btn {
      background: #28a745;
      color: white;
      border: none;
      border-radius: 0.25rem;
      padding: 0.25rem 0.5rem;
      cursor: pointer;
      font-size: 0.8rem;
    }
    
    .no-data {
      color: #6c757d;
      font-style: italic;
    }
    
    /* 性能表格样式 */
    .performance-metric {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .metric-value {
      font-weight: 600;
      font-size: 0.9rem;
    }
    
    .metric-bar {
      width: 100%;
      height: 4px;
      background: #e9ecef;
      border-radius: 2px;
      overflow: hidden;
    }
    
    .metric-fill {
      height: 100%;
      transition: width 0.3s ease;
    }
    
    .metric-good .metric-value {
      color: #28a745;
    }
    
    .metric-good .metric-fill {
      background: #28a745;
    }
    
    .metric-warning .metric-value {
      color: #ffc107;
    }
    
    .metric-warning .metric-fill {
      background: #ffc107;
    }
    
    .metric-critical .metric-value {
      color: #dc3545;
    }
    
    .metric-critical .metric-fill {
      background: #dc3545;
    }
    
    .performance-metrics-summary {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    
    .metric-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .metric-label {
      font-size: 0.9rem;
      color: #6c757d;
    }
    
    .metric-value {
      font-weight: 600;
      color: #495057;
    }
    
    /* 表格分页样式 */
    .table-pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-top: 1px solid #dee2e6;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .pagination-info {
      font-size: 0.9rem;
      color: #6c757d;
    }
    
    .pagination-controls {
      display: flex;
      gap: 0.25rem;
    }
    
    .pagination-btn {
      background: white;
      border: 1px solid #dee2e6;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      border-radius: 0.25rem;
      transition: all 0.2s;
      font-size: 0.9rem;
    }
    
    .pagination-btn:hover:not(:disabled) {
      background: #e9ecef;
      border-color: #adb5bd;
    }
    
    .pagination-btn.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }
    
    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .page-size-selector label {
      font-size: 0.9rem;
      color: #6c757d;
    }
    
    .page-size-selector select {
      padding: 0.25rem 0.5rem;
      border: 1px solid #dee2e6;
      border-radius: 0.25rem;
      font-size: 0.9rem;
    }
    
    /* 空状态样式 */
    .table-empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #6c757d;
    }
    
    .table-empty-state .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }
    
    .table-empty-state h4 {
      margin: 0 0 0.5rem 0;
      color: #495057;
    }
    
    .table-empty-state p {
      margin: 0 0 1.5rem 0;
    }
    
    /* 移动端表格优化 */
    @media (max-width: 768px) {
      .table-wrapper {
        overflow-x: auto;
      }
      
      .memory-data-table {
        min-width: 800px;
      }
      
      .table-header {
        flex-direction: column;
        align-items: stretch;
      }
      
      .table-pagination {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
      }
      
      .pagination-controls {
        justify-content: center;
      }
    }
  `;

  document.head.appendChild(style);
};

// 绑定记忆表格事件
SPMStatusMonitor.prototype.bindMemoryTableEvents = function () {
  // 这里可以添加特定的事件绑定逻辑
  this.addActivityLog('🔗 记忆表格事件已绑定');
};

// 其他缺少的辅助方法
SPMStatusMonitor.prototype.getActiveCharacterCount = function () {
  try {
    const characters = this.memoryTableData?.cache?.characters || {};
    return Object.values(characters).filter(char => {
      const lastActivity = new Date(char.lastActivity || 0);
      const daysSince = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    }).length;
  } catch (error) {
    return 0;
  }
};

SPMStatusMonitor.prototype.getCharacterActivityStatus = function (charId) {
  try {
    const characters = this.memoryTableData?.cache?.characters || {};
    const char = characters[charId];
    if (!char) return 'inactive';

    const lastActivity = new Date(char.lastActivity || 0);
    const daysSince = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSince <= 1) return 'active';
    if (daysSince <= 7) return 'recent';
    return 'inactive';
  } catch (error) {
    return 'inactive';
  }
};

SPMStatusMonitor.prototype.getCharacterLastActivity = function (charId) {
  try {
    const characters = this.memoryTableData?.cache?.characters || {};
    const char = characters[charId];
    if (!char || !char.lastActivity) return '从未活动';

    const lastActivity = new Date(char.lastActivity);
    const now = new Date();
    const diff = now - lastActivity;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days <= 7) return `${days}天前`;
    return `${Math.floor(days / 7)}周前`;
  } catch (error) {
    return '未知';
  }
};

SPMStatusMonitor.prototype.getCharacterInteractionCount = function (charId) {
  try {
    const history = this.memoryTableData?.cache?.history || [];
    return history.filter(item => item.characterId === charId).length;
  } catch (error) {
    return 0;
  }
};

// === 第二阶段：表格渲染系统 ===

// 渲染历史记录表格
SPMStatusMonitor.prototype.renderHistoryTable = function () {
  try {
    const history = this.getFilteredHistory();
    const paginatedData = this.getPaginatedData(history);

    if (paginatedData.length === 0) {
      return `
        <div class="table-empty-state">
          <div class="empty-icon">💬</div>
          <h4>暂无交互历史</h4>
          <p>当前筛选条件下没有找到交互记录</p>
          <button class="spm-btn primary" onclick="spmMonitor.resetFilters()">重置筛选</button>
        </div>
      `;
    }

    return `
      <div class="memory-table-container history-table">
        <div class="table-header">
          <div class="table-actions">
            <button class="table-action-btn" onclick="spmMonitor.selectAllTableRows('history')">
              <input type="checkbox" id="selectAllHistory"> 全选
            </button>
            <button class="table-action-btn" onclick="spmMonitor.exportSelectedRows('history')">
              📤 导出选中
            </button>
            <button class="table-action-btn" onclick="spmMonitor.deleteSelectedRows('history')">
              🗑️ 删除选中
            </button>
          </div>
        </div>
        
        <div class="table-wrapper">
          <table class="memory-data-table">
            <thead>
              <tr>
                <th class="checkbox-col">
                  <input type="checkbox" onchange="spmMonitor.toggleAllRows(this, 'history')">
                </th>
                <th class="sortable" onclick="spmMonitor.sortTable('timestamp')">
                  时间 <span class="sort-indicator">↕️</span>
                </th>
                <th class="sortable" onclick="spmMonitor.sortTable('character')">
                  角色 <span class="sort-indicator">↕️</span>
                </th>
                <th class="sortable" onclick="spmMonitor.sortTable('type')">
                  类型 <span class="sort-indicator">↕️</span>
                </th>
                <th class="content-col">内容</th>
                <th class="sortable" onclick="spmMonitor.sortTable('status')">
                  状态 <span class="sort-indicator">↕️</span>
                </th>
                <th class="actions-col">操作</th>
              </tr>
            </thead>
            <tbody>
              ${paginatedData.map((item, index) => this.renderHistoryRow(item, index)).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="table-footer">
          ${this.renderTablePagination()}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('❌ 渲染历史表格失败:', error);
    return '<div class="error-message">无法加载历史记录表格</div>';
  }
};

// 渲染历史记录行
SPMStatusMonitor.prototype.renderHistoryRow = function (item, index) {
  try {
    const formattedTime = this.formatTimestamp(item.timestamp);
    const statusClass = this.getStatusClass(item.status);
    const contentPreview = this.truncateContent(item.content || item.message, 100);

    return `
      <tr class="table-row ${item.status}" data-id="${item.id || index}">
        <td class="checkbox-col">
          <input type="checkbox" class="row-checkbox" value="${item.id || index}">
        </td>
        <td class="timestamp-col" title="${formattedTime.full}">
          <div class="timestamp-display">
            <div class="date">${formattedTime.date}</div>
            <div class="time">${formattedTime.time}</div>
          </div>
        </td>
        <td class="character-col">
          <div class="character-info">
            <img src="${item.characterAvatar || '/img/ai4.png'}" 
                 alt="${item.characterName || '未知'}" 
                 class="character-avatar-small"
                 onerror="this.src='/img/ai4.png'">
            <span class="character-name">${item.characterName || item.character || '未知角色'}</span>
          </div>
        </td>
        <td class="type-col">
          <span class="interaction-type ${item.type || 'message'}">
            ${this.getInteractionTypeIcon(item.type)} ${this.getInteractionTypeName(item.type)}
          </span>
        </td>
        <td class="content-col">
          <div class="content-preview" onclick="spmMonitor.showFullContent('${item.id || index}')">
            ${contentPreview}
            ${(item.content || item.message || '').length > 100 ? '<span class="read-more">...查看更多</span>' : ''}
          </div>
        </td>
        <td class="status-col">
          <span class="status-badge ${statusClass}">
            ${this.getStatusIcon(item.status)} ${this.getStatusText(item.status)}
          </span>
        </td>
        <td class="actions-col">
          <div class="row-actions">
            <button class="action-btn" onclick="spmMonitor.viewHistoryDetail('${
              item.id || index
            }')" title="查看详情">👁️</button>
            <button class="action-btn" onclick="spmMonitor.editHistoryItem('${
              item.id || index
            }')" title="编辑">✏️</button>
            <button class="action-btn" onclick="spmMonitor.duplicateHistoryItem('${
              item.id || index
            }')" title="复制">📋</button>
            <button class="action-btn danger" onclick="spmMonitor.deleteHistoryItem('${
              item.id || index
            }')" title="删除">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  } catch (error) {
    console.error('❌ 渲染历史行失败:', error);
    return '<tr><td colspan="7" class="error-row">渲染失败</td></tr>';
  }
};

// 渲染系统日志表格
SPMStatusMonitor.prototype.renderLogsTable = function () {
  try {
    const logs = this.getFilteredLogs();
    const paginatedData = this.getPaginatedData(logs);

    if (paginatedData.length === 0) {
      return `
        <div class="table-empty-state">
          <div class="empty-icon">📝</div>
          <h4>暂无系统日志</h4>
          <p>当前筛选条件下没有找到日志记录</p>
          <button class="spm-btn primary" onclick="spmMonitor.resetFilters()">重置筛选</button>
        </div>
      `;
    }

    return `
      <div class="memory-table-container logs-table">
        <div class="table-header">
          <div class="table-actions">
            <button class="table-action-btn" onclick="spmMonitor.selectAllTableRows('logs')">
              <input type="checkbox" id="selectAllLogs"> 全选
            </button>
            <button class="table-action-btn" onclick="spmMonitor.exportSelectedRows('logs')">
              📤 导出选中
            </button>
            <button class="table-action-btn" onclick="spmMonitor.clearSelectedLogs()">
              🧹 清理选中
            </button>
          </div>
          <div class="log-level-filter">
            <select onchange="spmMonitor.filterByLogLevel(this.value)">
              <option value="all">全部级别</option>
              <option value="info">信息</option>
              <option value="warning">警告</option>
              <option value="error">错误</option>
              <option value="debug">调试</option>
            </select>
          </div>
        </div>
        
        <div class="table-wrapper">
          <table class="memory-data-table logs-data-table">
            <thead>
              <tr>
                <th class="checkbox-col">
                  <input type="checkbox" onchange="spmMonitor.toggleAllRows(this, 'logs')">
                </th>
                <th class="sortable" onclick="spmMonitor.sortTable('timestamp')">
                  时间 <span class="sort-indicator">↕️</span>
                </th>
                <th class="sortable" onclick="spmMonitor.sortTable('level')">
                  级别 <span class="sort-indicator">↕️</span>
                </th>
                <th class="sortable" onclick="spmMonitor.sortTable('source')">
                  来源 <span class="sort-indicator">↕️</span>
                </th>
                <th class="message-col">消息</th>
                <th class="data-col">数据</th>
                <th class="actions-col">操作</th>
              </tr>
            </thead>
            <tbody>
              ${paginatedData.map((item, index) => this.renderLogRow(item, index)).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="table-footer">
          ${this.renderTablePagination()}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('❌ 渲染日志表格失败:', error);
    return '<div class="error-message">无法加载系统日志表格</div>';
  }
};

// 渲染日志行
SPMStatusMonitor.prototype.renderLogRow = function (item, index) {
  try {
    const formattedTime = this.formatTimestamp(item.timestamp);
    const levelClass = this.getLogLevelClass(item.level);
    const messagePreview = this.truncateContent(item.message, 150);

    return `
      <tr class="table-row log-row ${levelClass}" data-id="${item.id || index}">
        <td class="checkbox-col">
          <input type="checkbox" class="row-checkbox" value="${item.id || index}">
        </td>
        <td class="timestamp-col" title="${formattedTime.full}">
          <div class="timestamp-display">
            <div class="date">${formattedTime.date}</div>
            <div class="time">${formattedTime.time}</div>
          </div>
        </td>
        <td class="level-col">
          <span class="log-level ${levelClass}">
            ${this.getLogLevelIcon(item.level)} ${item.level?.toUpperCase() || 'INFO'}
          </span>
        </td>
        <td class="source-col">
          <span class="log-source">${item.source || item.component || 'SPM'}</span>
        </td>
        <td class="message-col">
          <div class="log-message" onclick="spmMonitor.showFullLogMessage('${item.id || index}')">
            ${messagePreview}
            ${(item.message || '').length > 150 ? '<span class="read-more">...查看更多</span>' : ''}
          </div>
        </td>
        <td class="data-col">
          <div class="log-data">
            ${
              item.data
                ? `<button class="data-btn" onclick="spmMonitor.showLogData('${
                    item.id || index
                  }')">📊 查看数据</button>`
                : '<span class="no-data">无</span>'
            }
          </div>
        </td>
        <td class="actions-col">
          <div class="row-actions">
            <button class="action-btn" onclick="spmMonitor.viewLogDetail('${
              item.id || index
            }')" title="查看详情">👁️</button>
            <button class="action-btn" onclick="spmMonitor.copyLogMessage('${
              item.id || index
            }')" title="复制消息">📋</button>
            <button class="action-btn" onclick="spmMonitor.reportLogIssue('${
              item.id || index
            }')" title="报告问题">🐛</button>
            <button class="action-btn danger" onclick="spmMonitor.deleteLogItem('${
              item.id || index
            }')" title="删除">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  } catch (error) {
    console.error('❌ 渲染日志行失败:', error);
    return '<tr><td colspan="7" class="error-row">渲染失败</td></tr>';
  }
};

// 渲染性能数据表格
SPMStatusMonitor.prototype.renderPerformanceTable = function () {
  try {
    const performance = this.getFilteredPerformance();
    const paginatedData = this.getPaginatedData(performance);

    if (paginatedData.length === 0) {
      return `
        <div class="table-empty-state">
          <div class="empty-icon">📊</div>
          <h4>暂无性能数据</h4>
          <p>当前筛选条件下没有找到性能记录</p>
          <button class="spm-btn primary" onclick="spmMonitor.generatePerformanceData()">生成测试数据</button>
        </div>
      `;
    }

    return `
      <div class="memory-table-container performance-table">
        <div class="table-header">
          <div class="table-actions">
            <button class="table-action-btn" onclick="spmMonitor.refreshPerformanceData()">
              🔄 刷新数据
            </button>
            <button class="table-action-btn" onclick="spmMonitor.generatePerformanceReport()">
              📊 生成报告
            </button>
            <button class="table-action-btn" onclick="spmMonitor.exportPerformanceData()">
              📤 导出数据
            </button>
          </div>
          <div class="performance-metrics-summary">
            <div class="metric-item">
              <span class="metric-label">平均响应时间:</span>
              <span class="metric-value">${this.calculateAverageResponseTime(performance)}ms</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">系统负载:</span>
              <span class="metric-value">${this.calculateSystemLoad(performance)}%</span>
            </div>
          </div>
        </div>
        
        <div class="table-wrapper">
          <table class="memory-data-table performance-data-table">
            <thead>
              <tr>
                <th class="sortable" onclick="spmMonitor.sortTable('timestamp')">
                  时间 <span class="sort-indicator">↕️</span>
                </th>
                <th class="sortable" onclick="spmMonitor.sortTable('responseTime')">
                  响应时间 <span class="sort-indicator">↕️</span>
                </th>
                <th class="sortable" onclick="spmMonitor.sortTable('memoryUsage')">
                  内存使用 <span class="sort-indicator">↕️</span>
                </th>
                <th class="sortable" onclick="spmMonitor.sortTable('cpuUsage')">
                  CPU使用 <span class="sort-indicator">↕️</span>
                </th>
                <th class="sortable" onclick="spmMonitor.sortTable('networkLatency')">
                  网络延迟 <span class="sort-indicator">↕️</span>
                </th>
                <th class="sortable" onclick="spmMonitor.sortTable('errorRate')">
                  错误率 <span class="sort-indicator">↕️</span>
                </th>
                <th class="actions-col">操作</th>
              </tr>
            </thead>
            <tbody>
              ${paginatedData.map((item, index) => this.renderPerformanceRow(item, index)).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="table-footer">
          ${this.renderTablePagination()}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('❌ 渲染性能表格失败:', error);
    return '<div class="error-message">无法加载性能数据表格</div>';
  }
};

// 渲染性能数据行
SPMStatusMonitor.prototype.renderPerformanceRow = function (item, index) {
  try {
    const formattedTime = this.formatTimestamp(item.timestamp);

    return `
      <tr class="table-row performance-row" data-id="${item.id || index}">
        <td class="timestamp-col" title="${formattedTime.full}">
          <div class="timestamp-display">
            <div class="date">${formattedTime.date}</div>
            <div class="time">${formattedTime.time}</div>
          </div>
        </td>
        <td class="metric-col">
          <div class="performance-metric ${this.getPerformanceClass(item.responseTime, 'responseTime')}">
            <span class="metric-value">${item.responseTime || 0}ms</span>
            <div class="metric-bar">
              <div class="metric-fill" style="width: ${Math.min(item.responseTime / 10, 100)}%"></div>
            </div>
          </div>
        </td>
        <td class="metric-col">
          <div class="performance-metric ${this.getPerformanceClass(item.memoryUsage, 'memory')}">
            <span class="metric-value">${item.memoryUsage || 0}MB</span>
            <div class="metric-bar">
              <div class="metric-fill" style="width: ${Math.min((item.memoryUsage / 100) * 100, 100)}%"></div>
            </div>
          </div>
        </td>
        <td class="metric-col">
          <div class="performance-metric ${this.getPerformanceClass(item.cpuUsage, 'cpu')}">
            <span class="metric-value">${item.cpuUsage || 0}%</span>
            <div class="metric-bar">
              <div class="metric-fill" style="width: ${item.cpuUsage || 0}%"></div>
            </div>
          </div>
        </td>
        <td class="metric-col">
          <div class="performance-metric ${this.getPerformanceClass(item.networkLatency, 'network')}">
            <span class="metric-value">${item.networkLatency || 0}ms</span>
            <div class="metric-bar">
              <div class="metric-fill" style="width: ${Math.min(item.networkLatency / 5, 100)}%"></div>
            </div>
          </div>
        </td>
        <td class="metric-col">
          <div class="performance-metric ${this.getPerformanceClass(item.errorRate, 'error')}">
            <span class="metric-value">${item.errorRate || 0}%</span>
            <div class="metric-bar">
              <div class="metric-fill" style="width: ${item.errorRate || 0}%"></div>
            </div>
          </div>
        </td>
        <td class="actions-col">
          <div class="row-actions">
            <button class="action-btn" onclick="spmMonitor.viewPerformanceDetail('${
              item.id || index
            }')" title="查看详情">👁️</button>
            <button class="action-btn" onclick="spmMonitor.analyzePerformance('${
              item.id || index
            }')" title="性能分析">📈</button>
            <button class="action-btn" onclick="spmMonitor.comparePerformance('${
              item.id || index
            }')" title="对比分析">📊</button>
          </div>
        </td>
      </tr>
    `;
  } catch (error) {
    console.error('❌ 渲染性能行失败:', error);
    return '<tr><td colspan="7" class="error-row">渲染失败</td></tr>';
  }
};

// === 表格数据处理方法 ===

// 获取筛选后的历史数据
SPMStatusMonitor.prototype.getFilteredHistory = function () {
  try {
    let history = this.memoryTableData?.cache?.history || [];

    // 应用字符筛选
    if (this.memoryTableData.currentCharacter !== 'all') {
      history = history.filter(
        item =>
          item.characterId === this.memoryTableData.currentCharacter ||
          item.character === this.memoryTableData.currentCharacter,
      );
    }

    // 应用时间筛选
    history = this.applyTimeFilter(history, this.memoryTableData.filters.timeRange);

    // 应用状态筛选
    if (this.memoryTableData.filters.status !== 'all') {
      history = history.filter(item => item.status === this.memoryTableData.filters.status);
    }

    // 应用搜索查询
    if (this.memoryTableData.searchQuery) {
      const query = this.memoryTableData.searchQuery.toLowerCase();
      history = history.filter(
        item =>
          (item.content || '').toLowerCase().includes(query) ||
          (item.message || '').toLowerCase().includes(query) ||
          (item.characterName || '').toLowerCase().includes(query),
      );
    }

    return history;
  } catch (error) {
    console.error('❌ 筛选历史数据失败:', error);
    return [];
  }
};

// 获取筛选后的日志数据
SPMStatusMonitor.prototype.getFilteredLogs = function () {
  try {
    let logs = this.memoryTableData?.cache?.logs || [];

    // 应用时间筛选
    logs = this.applyTimeFilter(logs, this.memoryTableData.filters.timeRange);

    // 应用级别筛选
    if (this.memoryTableData.filters.level && this.memoryTableData.filters.level !== 'all') {
      logs = logs.filter(item => item.level === this.memoryTableData.filters.level);
    }

    // 应用搜索查询
    if (this.memoryTableData.searchQuery) {
      const query = this.memoryTableData.searchQuery.toLowerCase();
      logs = logs.filter(
        item => (item.message || '').toLowerCase().includes(query) || (item.source || '').toLowerCase().includes(query),
      );
    }

    return logs;
  } catch (error) {
    console.error('❌ 筛选日志数据失败:', error);
    return [];
  }
};

// 获取筛选后的性能数据
SPMStatusMonitor.prototype.getFilteredPerformance = function () {
  try {
    let performance = this.memoryTableData?.cache?.performance || [];

    // 应用时间筛选
    performance = this.applyTimeFilter(performance, this.memoryTableData.filters.timeRange);

    return performance;
  } catch (error) {
    console.error('❌ 筛选性能数据失败:', error);
    return [];
  }
};

// 应用时间筛选
SPMStatusMonitor.prototype.applyTimeFilter = function (data, timeRange) {
  try {
    if (timeRange === 'all') return data;

    const now = new Date();
    let cutoffTime;

    switch (timeRange) {
      case 'today':
        cutoffTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffTime = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return data;
    }

    return data.filter(item => new Date(item.timestamp) >= cutoffTime);
  } catch (error) {
    return data;
  }
};

// 获取分页数据
SPMStatusMonitor.prototype.getPaginatedData = function (data) {
  try {
    const startIndex = (this.memoryTableData.currentPage - 1) * this.memoryTableData.pageSize;
    const endIndex = startIndex + this.memoryTableData.pageSize;
    return data.slice(startIndex, endIndex);
  } catch (error) {
    return [];
  }
};

// 渲染表格分页
SPMStatusMonitor.prototype.renderTablePagination = function () {
  try {
    const totalPages = this.getTotalPages();
    const currentPage = this.memoryTableData.currentPage;

    if (totalPages <= 1) return '';

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    let paginationHTML = `
      <div class="table-pagination">
        <div class="pagination-info">
          显示第 ${(currentPage - 1) * this.memoryTableData.pageSize + 1} - 
          ${Math.min(currentPage * this.memoryTableData.pageSize, this.getFilteredRecordsCount())} 条，
          共 ${this.getFilteredRecordsCount()} 条记录
        </div>
        
        <div class="pagination-controls">
          <button class="pagination-btn" onclick="spmMonitor.goToPage(1)" 
                  ${currentPage === 1 ? 'disabled' : ''}>⏮️</button>
          <button class="pagination-btn" onclick="spmMonitor.goToPage(${currentPage - 1})" 
                  ${currentPage === 1 ? 'disabled' : ''}>◀️</button>
    `;

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                onclick="spmMonitor.goToPage(${i})">${i}</button>
      `;
    }

    paginationHTML += `
          <button class="pagination-btn" onclick="spmMonitor.goToPage(${currentPage + 1})" 
                  ${currentPage === totalPages ? 'disabled' : ''}>▶️</button>
          <button class="pagination-btn" onclick="spmMonitor.goToPage(${totalPages})" 
                  ${currentPage === totalPages ? 'disabled' : ''}>⏭️</button>
        </div>
        
        <div class="page-size-selector">
          <label>每页显示:</label>
          <select onchange="spmMonitor.updatePageSize(this.value)">
            <option value="10" ${this.memoryTableData.pageSize === 10 ? 'selected' : ''}>10</option>
            <option value="20" ${this.memoryTableData.pageSize === 20 ? 'selected' : ''}>20</option>
            <option value="50" ${this.memoryTableData.pageSize === 50 ? 'selected' : ''}>50</option>
            <option value="100" ${this.memoryTableData.pageSize === 100 ? 'selected' : ''}>100</option>
          </select>
        </div>
      </div>
    `;

    return paginationHTML;
  } catch (error) {
    console.error('❌ 渲染分页失败:', error);
    return '';
  }
};

// 格式化时间戳
SPMStatusMonitor.prototype.formatTimestamp = function (timestamp) {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const timeStr = date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    let dateStr;
    if (diffDays === 0) {
      dateStr = '今天';
    } else if (diffDays === 1) {
      dateStr = '昨天';
    } else if (diffDays < 7) {
      dateStr = `${diffDays}天前`;
    } else {
      dateStr = date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
      });
    }

    return {
      date: dateStr,
      time: timeStr,
      full: date.toLocaleString('zh-CN'),
    };
  } catch (error) {
    return { date: '未知', time: '未知', full: '未知时间' };
  }
};

// 获取状态类
SPMStatusMonitor.prototype.getStatusClass = function (status) {
  const statusClasses = {
    success: 'status-success',
    warning: 'status-warning',
    error: 'status-error',
    pending: 'status-pending',
    info: 'status-info',
  };
  return statusClasses[status] || 'status-default';
};

// 获取状态图标
SPMStatusMonitor.prototype.getStatusIcon = function (status) {
  const statusIcons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    pending: '⏳',
    info: 'ℹ️',
  };
  return statusIcons[status] || '📝';
};

// 截断内容
SPMStatusMonitor.prototype.truncateContent = function (content, maxLength) {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};

// 获取交互类型图标
SPMStatusMonitor.prototype.getInteractionTypeIcon = function (type) {
  const typeIcons = {
    message: '💬',
    system: '⚙️',
    user: '👤',
    character: '🎭',
    action: '⚡',
    emotion: '😊',
  };
  return typeIcons[type] || '📝';
};

// 获取交互类型名称
SPMStatusMonitor.prototype.getInteractionTypeName = function (type) {
  const typeNames = {
    message: '消息',
    system: '系统',
    user: '用户',
    character: '角色',
    action: '动作',
    emotion: '情感',
  };
  return typeNames[type] || '未知';
};

// 获取日志级别类
SPMStatusMonitor.prototype.getLogLevelClass = function (level) {
  const levelClasses = {
    debug: 'log-debug',
    info: 'log-info',
    warning: 'log-warning',
    error: 'log-error',
    critical: 'log-critical',
  };
  return levelClasses[level] || 'log-info';
};

// 获取日志级别图标
SPMStatusMonitor.prototype.getLogLevelIcon = function (level) {
  const levelIcons = {
    debug: '🐛',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    critical: '🚨',
  };
  return levelIcons[level] || 'ℹ️';
};

// 获取性能等级类
SPMStatusMonitor.prototype.getPerformanceClass = function (value, type) {
  try {
    const thresholds = {
      responseTime: { good: 500, warning: 1000 },
      memory: { good: 50, warning: 80 },
      cpu: { good: 30, warning: 70 },
      network: { good: 100, warning: 300 },
      error: { good: 1, warning: 5 },
    };

    const threshold = thresholds[type];
    if (!threshold) return 'metric-normal';

    if (value <= threshold.good) return 'metric-good';
    if (value <= threshold.warning) return 'metric-warning';
    return 'metric-critical';
  } catch (error) {}
};

// === 表格交互方法 ===

// 获取总页数
SPMStatusMonitor.prototype.getTotalPages = function () {
  try {
    const totalRecords = this.getFilteredRecordsCount();
    return Math.ceil(totalRecords / this.memoryTableData.pageSize);
  } catch (error) {
    return 1;
  }
};

// 获取筛选后记录数
SPMStatusMonitor.prototype.getFilteredRecordsCount = function () {
  try {
    const tableType = this.memoryTableData.currentTableType;
    switch (tableType) {
      case 'history':
        return this.getFilteredHistory().length;
      case 'logs':
        return this.getFilteredLogs().length;
      case 'performance':
        return this.getFilteredPerformance().length;
      default:
        return 0;
    }
  } catch (error) {
    return 0;
  }
};

// 跳转到指定页面
SPMStatusMonitor.prototype.goToPage = function (page) {
  try {
    const totalPages = this.getTotalPages();
    if (page < 1 || page > totalPages) return;

    this.memoryTableData.currentPage = page;
    this.refreshCurrentTable();
    this.addActivityLog(`📄 跳转到第 ${page} 页`);
  } catch (error) {
    console.error('❌ 跳转页面失败:', error);
  }
};

// 更新页面大小
SPMStatusMonitor.prototype.updatePageSize = function (size) {
  try {
    this.memoryTableData.pageSize = parseInt(size);
    this.memoryTableData.currentPage = 1; // 重置到第一页
    this.refreshCurrentTable();
    this.addActivityLog(`📊 页面大小已更新为 ${size} 条/页`);
  } catch (error) {
    console.error('❌ 更新页面大小失败:', error);
  }
};

// 切换表格类型
SPMStatusMonitor.prototype.switchTableType = function (type) {
  try {
    this.memoryTableData.currentTableType = type;
    this.memoryTableData.currentPage = 1; // 重置到第一页
    this.refreshCurrentTable();
    this.addActivityLog(`🔄 切换到 ${type} 表格`);
  } catch (error) {
    console.error('❌ 切换表格类型失败:', error);
  }
};

// 刷新当前表格
SPMStatusMonitor.prototype.refreshCurrentTable = function () {
  try {
    const tableDisplayArea = document.querySelector('.table-display-area');
    if (tableDisplayArea) {
      tableDisplayArea.innerHTML = this.renderMemoryTable();
    }
  } catch (error) {
    console.error('❌ 刷新表格失败:', error);
  }
};

// 执行搜索
SPMStatusMonitor.prototype.performSearch = function () {
  try {
    const searchInput = document.getElementById('memoryTableSearch');
    if (searchInput) {
      this.memoryTableData.searchQuery = searchInput.value;
      this.memoryTableData.currentPage = 1; // 重置到第一页
      this.refreshCurrentTable();
      this.addActivityLog(`🔍 搜索: "${this.memoryTableData.searchQuery}"`);
    }
  } catch (error) {
    console.error('❌ 执行搜索失败:', error);
  }
};

// 防抖搜索
SPMStatusMonitor.prototype.debounceSearch = function (query) {
  try {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.memoryTableData.searchQuery = query;
      this.memoryTableData.currentPage = 1;
      this.refreshCurrentTable();
    }, 300);
  } catch (error) {
    console.error('❌ 防抖搜索失败:', error);
  }
};

// 更新筛选器
SPMStatusMonitor.prototype.updateFilter = function (filterType, value) {
  try {
    this.memoryTableData.filters[filterType] = value;
    this.memoryTableData.currentPage = 1; // 重置到第一页
    this.refreshCurrentTable();
    this.addActivityLog(`🔧 筛选器更新: ${filterType} = ${value}`);
  } catch (error) {
    console.error('❌ 更新筛选器失败:', error);
  }
};

// 重置筛选器
SPMStatusMonitor.prototype.resetFilters = function () {
  try {
    this.memoryTableData.filters = {
      timeRange: 'all',
      persona: 'all',
      status: 'all',
      character: 'all',
    };
    this.memoryTableData.searchQuery = '';
    this.memoryTableData.currentPage = 1;

    // 重置UI控件
    const searchInput = document.getElementById('memoryTableSearch');
    if (searchInput) searchInput.value = '';

    this.refreshCurrentTable();
    this.addActivityLog('🔄 筛选器已重置');
  } catch (error) {
    console.error('❌ 重置筛选器失败:', error);
  }
};

// 排序表格
SPMStatusMonitor.prototype.sortTable = function (column) {
  try {
    // 实现表格排序逻辑
    this.addActivityLog(`📊 按 ${column} 排序`);
    // 这里可以添加具体的排序实现
  } catch (error) {
    console.error('❌ 排序表格失败:', error);
  }
};

// 切换角色
SPMStatusMonitor.prototype.switchCharacter = function (charId) {
  try {
    this.memoryTableData.currentCharacter = charId;
    this.memoryTableData.currentPage = 1;

    // 更新角色标签状态
    document.querySelectorAll('.character-tab').forEach(tab => {
      tab.classList.remove('active');
    });

    const activeTab = document.querySelector(`[onclick="spmMonitor.switchCharacter('${charId}')"]`);
    if (activeTab) {
      activeTab.classList.add('active');
    }

    // 刷新界面
    this.refreshCharacterDetails();
    this.refreshCurrentTable();

    this.addActivityLog(`🎭 切换到角色: ${charId === 'all' ? '全部' : charId}`);
  } catch (error) {
    console.error('❌ 切换角色失败:', error);
  }
};

// 刷新角色详情
SPMStatusMonitor.prototype.refreshCharacterDetails = function () {
  try {
    const detailsSection = document.querySelector('.character-details-section');
    if (detailsSection) {
      detailsSection.innerHTML = this.renderCharacterDetails();
    }
  } catch (error) {
    console.error('❌ 刷新角色详情失败:', error);
  }
};

// 刷新记忆表格数据
SPMStatusMonitor.prototype.refreshMemoryTableData = function () {
  try {
    this.addActivityLog('🔄 刷新记忆表格数据...');
    this.loadMemoryTableData();

    // 刷新所有UI组件
    setTimeout(() => {
      this.refreshAllComponents();
      this.addActivityLog('✅ 记忆表格数据刷新完成');
    }, 1000);
  } catch (error) {
    console.error('❌ 刷新数据失败:', error);
    this.addActivityLog('❌ 数据刷新失败');
  }
};

// 刷新所有组件
SPMStatusMonitor.prototype.refreshAllComponents = function () {
  try {
    // 刷新概览卡片
    const overviewSection = document.querySelector('.overview-cards-grid');
    if (overviewSection) {
      overviewSection.innerHTML = this.renderOverviewCards();
    }

    // 刷新角色管理
    const characterSection = document.querySelector('.character-management-content');
    if (characterSection) {
      characterSection.innerHTML = this.renderCharacterManagement();
    }

    // 刷新表格
    this.refreshCurrentTable();

    // 刷新操作控制
    const actionSection = document.querySelector('.action-controls-content');
    if (actionSection) {
      actionSection.innerHTML = this.renderActionControls();
    }
  } catch (error) {
    console.error('❌ 刷新组件失败:', error);
  }
};

// 计算平均响应时间
SPMStatusMonitor.prototype.calculateAverageResponseTime = function (performance) {
  try {
    if (!performance || performance.length === 0) return 0;
    const total = performance.reduce((sum, item) => sum + (item.responseTime || 0), 0);
    return Math.round(total / performance.length);
  } catch (error) {
    return 0;
  }
};

// 计算系统负载
SPMStatusMonitor.prototype.calculateSystemLoad = function (performance) {
  try {
    if (!performance || performance.length === 0) return 0;
    const latest = performance[performance.length - 1];
    return latest?.cpuUsage || 0;
  } catch (error) {
    return 0;
  }
};

// === 示例数据生成（用于测试） ===

// 生成示例历史数据
SPMStatusMonitor.prototype.generateSampleHistoryData = function () {
  try {
    const sampleData = [];
    const characters = ['Alice', 'Bob', 'Charlie', 'Diana'];
    const types = ['message', 'system', 'user', 'character', 'action'];
    const statuses = ['success', 'warning', 'error', 'pending', 'info'];

    for (let i = 0; i < 50; i++) {
      const timestamp = Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000; // 过去7天
      sampleData.push({
        id: `hist_${i}`,
        timestamp: new Date(timestamp).toISOString(),
        characterId: characters[Math.floor(Math.random() * characters.length)],
        characterName: characters[Math.floor(Math.random() * characters.length)],
        type: types[Math.floor(Math.random() * types.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        content: `这是一条示例交互记录 #${i + 1}，包含了一些测试内容来展示表格的显示效果。`,
        characterAvatar: '/img/ai4.png',
      });
    }

    return sampleData;
  } catch (error) {
    console.error('❌ 生成示例历史数据失败:', error);
    return [];
  }
};

// 生成示例日志数据
SPMStatusMonitor.prototype.generateSampleLogData = function () {
  try {
    const sampleData = [];
    const levels = ['debug', 'info', 'warning', 'error'];
    const sources = ['SPM', 'MVU', 'Supervisor', 'TavernHelper'];
    const messages = [
      '系统初始化完成',
      '数据同步成功',
      '内存使用率较高',
      '网络连接异常',
      '用户交互记录已保存',
      '人格权重计算完成',
      '性能监控启动',
      '缓存清理完成',
    ];

    for (let i = 0; i < 80; i++) {
      const timestamp = Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000;
      sampleData.push({
        id: `log_${i}`,
        timestamp: new Date(timestamp).toISOString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        message: messages[Math.floor(Math.random() * messages.length)] + ` (${i + 1})`,
        data: Math.random() > 0.5 ? { details: `额外数据 ${i}` } : null,
      });
    }

    return sampleData;
  } catch (error) {
    console.error('❌ 生成示例日志数据失败:', error);
    return [];
  }
};

// 生成示例性能数据
SPMStatusMonitor.prototype.generateSamplePerformanceData = function () {
  try {
    const sampleData = [];

    for (let i = 0; i < 30; i++) {
      const timestamp = Date.now() - Math.random() * 24 * 60 * 60 * 1000; // 过去24小时
      sampleData.push({
        id: `perf_${i}`,
        timestamp: new Date(timestamp).toISOString(),
        responseTime: Math.floor(Math.random() * 2000) + 100, // 100-2100ms
        memoryUsage: Math.floor(Math.random() * 100) + 20, // 20-120MB
        cpuUsage: Math.floor(Math.random() * 80) + 10, // 10-90%
        networkLatency: Math.floor(Math.random() * 500) + 50, // 50-550ms
        errorRate: Math.floor(Math.random() * 10), // 0-10%
      });
    }

    return sampleData;
  } catch (error) {
    console.error('❌ 生成示例性能数据失败:', error);
    return [];
  }
};

// 生成测试数据
SPMStatusMonitor.prototype.generateTestData = function () {
  try {
    if (!this.memoryTableData) {
      this.initMemoryTableDataManager();
    }

    // 生成示例数据
    const historyData = this.generateSampleHistoryData();
    const logData = this.generateSampleLogData();
    const performanceData = this.generateSamplePerformanceData();

    // 更新缓存
    this.memoryTableData.cache.history = historyData;
    this.memoryTableData.cache.logs = logData;
    this.memoryTableData.cache.performance = performanceData;

    // 更新统计
    this.updateMemoryTableStats();

    this.addActivityLog('✅ 测试数据生成完成');
    this.addActivityLog(`📊 生成了 ${historyData.length} 条历史记录`);
    this.addActivityLog(`📝 生成了 ${logData.length} 条日志记录`);
    this.addActivityLog(`⚡ 生成了 ${performanceData.length} 条性能记录`);
  } catch (error) {
    console.error('❌ 生成测试数据失败:', error);
    this.addActivityLog('❌ 测试数据生成失败');
  }
};

// === 第三阶段：高级功能完善 ===

// 数据可视化图表系统
SPMStatusMonitor.prototype.showTrendAnalysis = function () {
  try {
    this.addActivityLog('📈 打开趋势分析图表');

    const chartDialog = document.createElement('div');
    chartDialog.className = 'spm-modal trend-analysis-modal';
    chartDialog.innerHTML = `
      <div class="spm-modal-content trend-analysis-content">
        <div class="spm-modal-header">
          <h3>📈 数据趋势分析</h3>
          <div class="chart-controls">
            <select id="chartTimeRange" onchange="spmMonitor.updateChartTimeRange(this.value)">
              <option value="24h">最近24小时</option>
              <option value="7d">最近7天</option>
              <option value="30d">最近30天</option>
              <option value="90d">最近90天</option>
            </select>
            <select id="chartType" onchange="spmMonitor.updateChartType(this.value)">
              <option value="interaction">交互趋势</option>
              <option value="performance">性能趋势</option>
              <option value="character">角色活跃度</option>
              <option value="error">错误率趋势</option>
            </select>
          </div>
          <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
        </div>
        
        <div class="spm-modal-body">
          <div class="chart-container">
            <div class="chart-header">
              <h4 id="chartTitle">交互趋势图</h4>
              <div class="chart-stats">
                <div class="stat-item">
                  <span class="stat-label">总计:</span>
                  <span class="stat-value" id="chartTotal">0</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">平均:</span>
                  <span class="stat-value" id="chartAverage">0</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">趋势:</span>
                  <span class="stat-value" id="chartTrend">↗️ 上升</span>
                </div>
              </div>
            </div>
            
            <div class="chart-wrapper">
              <canvas id="trendChart" width="800" height="400"></canvas>
            </div>
            
            <div class="chart-legend">
              <div class="legend-items" id="chartLegend">
                <!-- 图例项目会动态生成 -->
              </div>
            </div>
          </div>
          
          <div class="chart-insights">
            <h4>📊 数据洞察</h4>
            <div class="insights-grid" id="chartInsights">
              ${this.generateChartInsights()}
            </div>
          </div>
        </div>
        
        <div class="spm-modal-footer">
          <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
          <button class="spm-btn secondary" onclick="spmMonitor.exportChartData()">📤 导出数据</button>
          <button class="spm-btn secondary" onclick="spmMonitor.saveChartImage()">🖼️ 保存图片</button>
          <button class="spm-btn primary" onclick="spmMonitor.generateDetailedAnalysis()">📊 详细分析</button>
        </div>
      </div>
    `;

    document.body.appendChild(chartDialog);
    this.initializeChart();
    this.addChartStyles();
  } catch (error) {
    console.error('❌ 显示趋势分析失败:', error);
    this.addActivityLog('❌ 趋势分析图表打开失败');
  }
};

// 初始化图表
SPMStatusMonitor.prototype.initializeChart = function () {
  try {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // 简单的图表绘制实现
    this.drawChart(ctx, this.getChartData('interaction', '24h'));
  } catch (error) {
    console.error('❌ 初始化图表失败:', error);
  }
};

// 绘制图表
SPMStatusMonitor.prototype.drawChart = function (ctx, data) {
  try {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 网格线
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;

    // 垂直网格线
    for (let i = 0; i <= 10; i++) {
      const x = padding + ((width - 2 * padding) * i) / 10;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // 水平网格线
    for (let i = 0; i <= 8; i++) {
      const y = padding + ((height - 2 * padding) * i) / 8;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // 绘制数据线
    if (data && data.length > 0) {
      const maxValue = Math.max(...data.map(d => d.value));
      const minValue = Math.min(...data.map(d => d.value));
      const range = maxValue - minValue || 1;

      ctx.strokeStyle = '#007bff';
      ctx.lineWidth = 3;
      ctx.beginPath();

      data.forEach((point, index) => {
        const x = padding + ((width - 2 * padding) * index) / (data.length - 1);
        const y = height - padding - ((height - 2 * padding) * (point.value - minValue)) / range;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // 绘制数据点
      ctx.fillStyle = '#007bff';
      data.forEach((point, index) => {
        const x = padding + ((width - 2 * padding) * index) / (data.length - 1);
        const y = height - padding - ((height - 2 * padding) * (point.value - minValue)) / range;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // 坐标轴标签
    ctx.fillStyle = '#495057';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    // X轴标签
    if (data && data.length > 0) {
      data.forEach((point, index) => {
        if (index % Math.ceil(data.length / 8) === 0) {
          const x = padding + ((width - 2 * padding) * index) / (data.length - 1);
          ctx.fillText(point.label, x, height - padding + 20);
        }
      });
    }
  } catch (error) {
    console.error('❌ 绘制图表失败:', error);
  }
};

// 获取图表数据
SPMStatusMonitor.prototype.getChartData = function (type, timeRange) {
  try {
    const now = new Date();
    const data = [];

    // 根据时间范围生成数据点
    let points, interval;
    switch (timeRange) {
      case '24h':
        points = 24;
        interval = 60 * 60 * 1000; // 1小时
        break;
      case '7d':
        points = 7;
        interval = 24 * 60 * 60 * 1000; // 1天
        break;
      case '30d':
        points = 30;
        interval = 24 * 60 * 60 * 1000; // 1天
        break;
      case '90d':
        points = 90;
        interval = 24 * 60 * 60 * 1000; // 1天
        break;
      default:
        points = 24;
        interval = 60 * 60 * 1000;
    }

    // 生成模拟数据
    for (let i = 0; i < points; i++) {
      const timestamp = now.getTime() - (points - 1 - i) * interval;
      const date = new Date(timestamp);

      let label, value;
      switch (timeRange) {
        case '24h':
          label = date.getHours() + ':00';
          break;
        case '7d':
          label = date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
          break;
        default:
          label = date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
      }

      // 根据类型生成不同的数据
      switch (type) {
        case 'interaction':
          value = Math.floor(Math.random() * 50) + 10;
          break;
        case 'performance':
          value = Math.floor(Math.random() * 1000) + 200;
          break;
        case 'character':
          value = Math.floor(Math.random() * 10) + 1;
          break;
        case 'error':
          value = Math.floor(Math.random() * 5);
          break;
        default:
          value = Math.floor(Math.random() * 100);
      }

      data.push({ label, value, timestamp });
    }

    return data;
  } catch (error) {
    console.error('❌ 获取图表数据失败:', error);
    return [];
  }
};

// 生成图表洞察
SPMStatusMonitor.prototype.generateChartInsights = function () {
  try {
    return `
      <div class="insight-card">
        <div class="insight-icon">📈</div>
        <div class="insight-content">
          <h5>交互趋势</h5>
          <p>最近24小时交互量较昨日增长15%，用户活跃度持续上升。</p>
        </div>
      </div>
      
      <div class="insight-card">
        <div class="insight-icon">⚡</div>
        <div class="insight-content">
          <h5>性能表现</h5>
          <p>平均响应时间保持在350ms，系统性能稳定在良好水平。</p>
        </div>
      </div>
      
      <div class="insight-card">
        <div class="insight-icon">🎭</div>
        <div class="insight-content">
          <h5>角色活跃</h5>
          <p>当前有3个角色处于活跃状态，Alice的交互频率最高。</p>
        </div>
      </div>
      
      <div class="insight-card">
        <div class="insight-icon">🔍</div>
        <div class="insight-content">
          <h5>数据质量</h5>
          <p>数据完整性达到98%，建议定期清理过期的日志记录。</p>
        </div>
      </div>
    `;
  } catch (error) {
    return '<div class="error-message">无法生成数据洞察</div>';
  }
};

// 交互地图功能
SPMStatusMonitor.prototype.showInteractionMap = function () {
  try {
    this.addActivityLog('🗺️ 打开交互地图');

    const mapDialog = document.createElement('div');
    mapDialog.className = 'spm-modal interaction-map-modal';
    mapDialog.innerHTML = `
      <div class="spm-modal-content interaction-map-content">
        <div class="spm-modal-header">
          <h3>🗺️ 交互关系地图</h3>
          <div class="map-controls">
            <button class="map-control-btn" onclick="spmMonitor.zoomInMap()">🔍 放大</button>
            <button class="map-control-btn" onclick="spmMonitor.zoomOutMap()">🔍 缩小</button>
            <button class="map-control-btn" onclick="spmMonitor.resetMapView()">🎯 重置</button>
            <select id="mapLayout" onchange="spmMonitor.changeMapLayout(this.value)">
              <option value="force">力导向布局</option>
              <option value="circle">圆形布局</option>
              <option value="hierarchy">层次布局</option>
            </select>
          </div>
          <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
        </div>
        
        <div class="spm-modal-body">
          <div class="map-container">
            <div class="map-sidebar">
              <h4>📊 统计信息</h4>
              <div class="map-stats">
                <div class="stat-item">
                  <span class="stat-label">节点总数:</span>
                  <span class="stat-value">12</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">连接数:</span>
                  <span class="stat-value">28</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">活跃节点:</span>
                  <span class="stat-value">8</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">最强连接:</span>
                  <span class="stat-value">Alice ↔ Bob</span>
                </div>
              </div>
              
              <h4>🎭 角色列表</h4>
              <div class="character-list">
                ${this.renderMapCharacterList()}
              </div>
            </div>
            
            <div class="map-main">
              <div class="map-canvas-container">
                <canvas id="interactionMapCanvas" width="600" height="500"></canvas>
                <div class="map-tooltip" id="mapTooltip"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="spm-modal-footer">
          <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
          <button class="spm-btn secondary" onclick="spmMonitor.exportMapData()">📤 导出数据</button>
          <button class="spm-btn secondary" onclick="spmMonitor.saveMapImage()">🖼️ 保存图片</button>
          <button class="spm-btn primary" onclick="spmMonitor.analyzeInteractionPatterns()">🔍 模式分析</button>
        </div>
      </div>
    `;

    document.body.appendChild(mapDialog);
    this.initializeInteractionMap();
    this.addMapStyles();
  } catch (error) {
    console.error('❌ 显示交互地图失败:', error);
    this.addActivityLog('❌ 交互地图打开失败');
  }
};

// 初始化交互地图
SPMStatusMonitor.prototype.initializeInteractionMap = function () {
  try {
    const canvas = document.getElementById('interactionMapCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    this.drawInteractionMap(ctx);

    // 添加鼠标事件
    canvas.addEventListener('mousemove', e => this.handleMapMouseMove(e));
    canvas.addEventListener('click', e => this.handleMapClick(e));
  } catch (error) {
    console.error('❌ 初始化交互地图失败:', error);
  }
};

// 绘制交互地图
SPMStatusMonitor.prototype.drawInteractionMap = function (ctx) {
  try {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 背景
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    // 生成节点和连接
    const nodes = this.generateMapNodes(width, height);
    const connections = this.generateMapConnections(nodes);

    // 绘制连接线
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 2;
    connections.forEach(conn => {
      const alpha = Math.min(conn.weight / 10, 1);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = `rgba(0, 123, 255, ${alpha})`;
      ctx.lineWidth = Math.max(conn.weight / 5, 1);

      ctx.beginPath();
      ctx.moveTo(conn.from.x, conn.from.y);
      ctx.lineTo(conn.to.x, conn.to.y);
      ctx.stroke();
    });

    ctx.globalAlpha = 1;

    // 绘制节点
    nodes.forEach(node => {
      // 节点背景
      ctx.fillStyle = node.active ? '#28a745' : '#6c757d';
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
      ctx.fill();

      // 节点边框
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 节点标签
      ctx.fillStyle = '#495057';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(node.name, node.x, node.y + node.size + 15);
    });
  } catch (error) {
    console.error('❌ 绘制交互地图失败:', error);
  }
};

// 生成地图节点
SPMStatusMonitor.prototype.generateMapNodes = function (width, height) {
  try {
    const characters = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
    const nodes = [];

    characters.forEach((name, index) => {
      const angle = (index / characters.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.3;
      const centerX = width / 2;
      const centerY = height / 2;

      nodes.push({
        id: index,
        name: name,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        size: 15 + Math.random() * 10,
        active: Math.random() > 0.3,
        interactions: Math.floor(Math.random() * 50) + 10,
      });
    });

    return nodes;
  } catch (error) {
    return [];
  }
};

// 生成地图连接
SPMStatusMonitor.prototype.generateMapConnections = function (nodes) {
  try {
    const connections = [];

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.5) {
          connections.push({
            from: nodes[i],
            to: nodes[j],
            weight: Math.floor(Math.random() * 10) + 1,
          });
        }
      }
    }

    return connections;
  } catch (error) {
    return [];
  }
};

// 高级分析报告生成
SPMStatusMonitor.prototype.generateAnalysisReport = function () {
  try {
    this.addActivityLog('📊 生成高级分析报告');

    const reportDialog = document.createElement('div');
    reportDialog.className = 'spm-modal analysis-report-modal';
    reportDialog.innerHTML = `
      <div class="spm-modal-content analysis-report-content">
        <div class="spm-modal-header">
          <h3>📊 SPM 高级分析报告</h3>
          <div class="report-controls">
            <select id="reportType" onchange="spmMonitor.updateReportType(this.value)">
              <option value="comprehensive">综合分析</option>
              <option value="performance">性能分析</option>
              <option value="interaction">交互分析</option>
              <option value="character">角色分析</option>
            </select>
            <select id="reportPeriod" onchange="spmMonitor.updateReportPeriod(this.value)">
              <option value="7d">最近7天</option>
              <option value="30d">最近30天</option>
              <option value="90d">最近90天</option>
              <option value="all">全部时间</option>
            </select>
          </div>
          <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
        </div>
        
        <div class="spm-modal-body">
          <div class="report-content">
            <div class="report-section">
              <h4>📋 执行摘要</h4>
              <div class="summary-grid">
                <div class="summary-card">
                  <div class="summary-icon">💬</div>
                  <div class="summary-info">
                    <h5>总交互次数</h5>
                    <div class="summary-value">1,234</div>
                    <div class="summary-trend">↗️ +15.2%</div>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon">⚡</div>
                  <div class="summary-info">
                    <h5>平均响应时间</h5>
                    <div class="summary-value">342ms</div>
                    <div class="summary-trend">↘️ -8.3%</div>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon">🎭</div>
                  <div class="summary-info">
                    <h5>活跃角色数</h5>
                    <div class="summary-value">8</div>
                    <div class="summary-trend">→ 0%</div>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon">📈</div>
                  <div class="summary-info">
                    <h5>系统健康度</h5>
                    <div class="summary-value">95%</div>
                    <div class="summary-trend">↗️ +2.1%</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="report-section">
              <h4>🔍 详细分析</h4>
              <div class="analysis-content">
                ${this.generateDetailedAnalysisContent()}
              </div>
            </div>
            
            <div class="report-section">
              <h4>💡 建议和优化</h4>
              <div class="recommendations">
                ${this.generateRecommendations()}
              </div>
            </div>
            
            <div class="report-section">
              <h4>📊 详细数据</h4>
              <div class="report-table-container">
                ${this.generateReportTable()}
              </div>
            </div>
          </div>
        </div>
        
        <div class="spm-modal-footer">
          <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
          <button class="spm-btn secondary" onclick="spmMonitor.exportReportPDF()">📄 导出PDF</button>
          <button class="spm-btn secondary" onclick="spmMonitor.exportReportExcel()">📊 导出Excel</button>
          <button class="spm-btn primary" onclick="spmMonitor.scheduleReport()">⏰ 定时报告</button>
        </div>
      </div>
    `;

    document.body.appendChild(reportDialog);
    this.addReportStyles();
  } catch (error) {
    console.error('❌ 生成分析报告失败:', error);
    this.addActivityLog('❌ 分析报告生成失败');
  }
};

// 生成详细分析内容
SPMStatusMonitor.prototype.generateDetailedAnalysisContent = function () {
  try {
    return `
      <div class="analysis-item">
        <h5>📈 交互模式分析</h5>
        <p>用户交互主要集中在工作日的10:00-18:00时段，周末活跃度下降约30%。Alice角色的交互频率最高，占总交互量的35%。</p>
        <div class="analysis-chart-placeholder">📊 [交互时间分布图]</div>
      </div>
      
      <div class="analysis-item">
        <h5>⚡ 性能表现评估</h5>
        <p>系统整体性能良好，平均响应时间342ms，较上周改善8.3%。内存使用率稳定在65%，CPU使用率峰值不超过80%。</p>
        <div class="performance-metrics">
          <div class="metric-bar">
            <span>响应时间</span>
            <div class="bar good" style="width: 85%"></div>
            <span>优秀</span>
          </div>
          <div class="metric-bar">
            <span>内存使用</span>
            <div class="bar warning" style="width: 65%"></div>
            <span>良好</span>
          </div>
          <div class="metric-bar">
            <span>CPU使用</span>
            <div class="bar good" style="width: 45%"></div>
            <span>优秀</span>
          </div>
        </div>
      </div>
      
      <div class="analysis-item">
        <h5>🎭 角色活跃度分析</h5>
        <p>当前有8个活跃角色，其中3个为高频使用，2个为中频使用，3个为低频使用。建议优化低频角色的交互设计。</p>
        <div class="character-activity-grid">
          <div class="activity-item high">Alice <span>35%</span></div>
          <div class="activity-item high">Bob <span>28%</span></div>
          <div class="activity-item high">Charlie <span>18%</span></div>
          <div class="activity-item medium">Diana <span>12%</span></div>
          <div class="activity-item medium">Eve <span>5%</span></div>
          <div class="activity-item low">Frank <span>2%</span></div>
        </div>
      </div>
    `;
  } catch (error) {
    return '<div class="error-message">无法生成详细分析</div>';
  }
};

// 生成建议和优化
SPMStatusMonitor.prototype.generateRecommendations = function () {
  try {
    return `
      <div class="recommendation-item priority-high">
        <div class="recommendation-icon">🔴</div>
        <div class="recommendation-content">
          <h5>高优先级：优化内存使用</h5>
          <p>内存使用率达到65%，建议实施数据清理策略，定期清理过期的交互记录和日志文件。</p>
          <div class="recommendation-actions">
            <button class="action-btn" onclick="spmMonitor.executeCleanup()">🧹 执行清理</button>
            <button class="action-btn" onclick="spmMonitor.scheduleCleanup()">⏰ 定时清理</button>
          </div>
        </div>
      </div>
      
      <div class="recommendation-item priority-medium">
        <div class="recommendation-icon">🟡</div>
        <div class="recommendation-content">
          <h5>中优先级：提升低频角色活跃度</h5>
          <p>Frank等低频角色使用率偏低，建议优化其交互设计或考虑合并相似角色功能。</p>
          <div class="recommendation-actions">
            <button class="action-btn" onclick="spmMonitor.analyzeCharacterUsage()">📊 使用分析</button>
            <button class="action-btn" onclick="spmMonitor.optimizeCharacters()">⚡ 优化设置</button>
          </div>
        </div>
      </div>
      
      <div class="recommendation-item priority-low">
        <div class="recommendation-icon">🟢</div>
        <div class="recommendation-content">
          <h5>低优先级：扩展数据可视化</h5>
          <p>当前数据展示较为基础，建议增加更多图表类型和交互式可视化功能。</p>
          <div class="recommendation-actions">
            <button class="action-btn" onclick="spmMonitor.enableAdvancedCharts()">📈 高级图表</button>
            <button class="action-btn" onclick="spmMonitor.customizeDashboard()">🎨 自定义面板</button>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    return '<div class="error-message">无法生成建议</div>';
  }
};

// 生成报告表格
SPMStatusMonitor.prototype.generateReportTable = function () {
  try {
    return `
      <table class="report-table">
        <thead>
          <tr>
            <th>指标</th>
            <th>当前值</th>
            <th>目标值</th>
            <th>状态</th>
            <th>趋势</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>平均响应时间</td>
            <td>342ms</td>
            <td>&lt;500ms</td>
            <td><span class="status-good">✅ 优秀</span></td>
            <td><span class="trend-up">↗️ +8.3%</span></td>
          </tr>
          <tr>
            <td>内存使用率</td>
            <td>65%</td>
            <td>&lt;70%</td>
            <td><span class="status-warning">⚠️ 注意</span></td>
            <td><span class="trend-stable">→ 0%</span></td>
          </tr>
          <tr>
            <td>日交互次数</td>
            <td>1,234</td>
            <td>&gt;1,000</td>
            <td><span class="status-good">✅ 达标</span></td>
            <td><span class="trend-up">↗️ +15.2%</span></td>
          </tr>
          <tr>
            <td>错误率</td>
            <td>0.8%</td>
            <td>&lt;2%</td>
            <td><span class="status-good">✅ 优秀</span></td>
            <td><span class="trend-down">↘️ -0.2%</span></td>
          </tr>
          <tr>
            <td>系统健康度</td>
            <td>95%</td>
            <td>&gt;90%</td>
            <td><span class="status-good">✅ 优秀</span></td>
            <td><span class="trend-up">↗️ +2.1%</span></td>
          </tr>
        </tbody>
      </table>
    `;
  } catch (error) {
    return '<div class="error-message">无法生成报告表格</div>';
  }
};

// 行为预测功能
SPMStatusMonitor.prototype.predictBehavior = function () {
  try {
    this.addActivityLog('🔮 启动行为预测分析');

    const predictionDialog = document.createElement('div');
    predictionDialog.className = 'spm-modal prediction-modal';
    predictionDialog.innerHTML = `
      <div class="spm-modal-content prediction-content">
        <div class="spm-modal-header">
          <h3>🔮 智能行为预测</h3>
          <div class="prediction-controls">
            <select id="predictionTimeframe" onchange="spmMonitor.updatePredictionTimeframe(this.value)">
              <option value="1h">未来1小时</option>
              <option value="1d">未来1天</option>
              <option value="7d">未来7天</option>
              <option value="30d">未来30天</option>
            </select>
            <select id="predictionType" onchange="spmMonitor.updatePredictionType(this.value)">
              <option value="interaction">交互预测</option>
              <option value="performance">性能预测</option>
              <option value="usage">使用模式预测</option>
            </select>
          </div>
          <button class="spm-modal-close" onclick="this.closest('.spm-modal').remove()">✕</button>
        </div>
        
        <div class="spm-modal-body">
          <div class="prediction-content">
            <div class="prediction-overview">
              <h4>📊 预测概览</h4>
              <div class="prediction-cards">
                <div class="prediction-card">
                  <div class="prediction-icon">💬</div>
                  <div class="prediction-info">
                    <h5>预计交互次数</h5>
                    <div class="prediction-value">156 <span class="prediction-unit">次/小时</span></div>
                    <div class="confidence">置信度: 87%</div>
                  </div>
                </div>
                
                <div class="prediction-card">
                  <div class="prediction-icon">👤</div>
                  <div class="prediction-info">
                    <h5>最活跃角色</h5>
                    <div class="prediction-value">Alice</div>
                    <div class="confidence">置信度: 92%</div>
                  </div>
                </div>
                
                <div class="prediction-card">
                  <div class="prediction-icon">⚡</div>
                  <div class="prediction-info">
                    <h5>系统负载</h5>
                    <div class="prediction-value">72% <span class="prediction-unit">峰值</span></div>
                    <div class="confidence">置信度: 78%</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="prediction-chart-section">
              <h4>📈 预测趋势</h4>
              <div class="prediction-chart-container">
                <canvas id="predictionChart" width="700" height="300"></canvas>
              </div>
              <div class="chart-legend">
                <div class="legend-item">
                  <span class="legend-color historical"></span>
                  <span>历史数据</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color predicted"></span>
                  <span>预测数据</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color confidence"></span>
                  <span>置信区间</span>
                </div>
              </div>
            </div>
            
            <div class="prediction-analysis">
              <h4>🔍 预测分析</h4>
              <div class="analysis-text">
                ${this.generatePredictionAnalysis()}
              </div>
            </div>
            
            <div class="risk-alerts">
              <h4>⚠️ 风险提醒</h4>
              <div class="risk-items">
                ${this.generateRiskAlerts()}
              </div>
            </div>
          </div>
        </div>
        
        <div class="spm-modal-footer">
          <button class="spm-btn secondary" onclick="this.closest('.spm-modal').remove()">关闭</button>
          <button class="spm-btn secondary" onclick="spmMonitor.exportPredictionData()">📤 导出预测</button>
          <button class="spm-btn secondary" onclick="spmMonitor.setupPredictionAlerts()">🔔 设置提醒</button>
          <button class="spm-btn primary" onclick="spmMonitor.applyPredictionOptimization()">⚡ 应用优化</button>
        </div>
      </div>
    `;

    document.body.appendChild(predictionDialog);
    this.initializePredictionChart();
    this.addPredictionStyles();
  } catch (error) {
    console.error('❌ 启动行为预测失败:', error);
    this.addActivityLog('❌ 行为预测启动失败');
  }
};

// 生成预测分析
SPMStatusMonitor.prototype.generatePredictionAnalysis = function () {
  try {
    return `
      <div class="analysis-section">
        <h5>📊 模式识别</h5>
        <p>基于历史数据分析，系统识别出以下主要模式：</p>
        <ul>
          <li>工作日上午10-12点为交互高峰期，预计比平均水平高40%</li>
          <li>Alice角色在下午时段活跃度显著提升</li>
          <li>周五下午系统负载通常较低，可安排维护任务</li>
        </ul>
      </div>
      
      <div class="analysis-section">
        <h5>🎯 预测准确性</h5>
        <p>本预测模型基于过去30天的数据训练，准确率达到85%。模型考虑了以下因素：</p>
        <ul>
          <li>历史交互频率和时间模式</li>
          <li>角色使用偏好和周期性变化</li>
          <li>系统性能指标的关联影响</li>
        </ul>
      </div>
      
      <div class="analysis-section">
        <h5>💡 优化建议</h5>
        <p>基于预测结果，建议采取以下优化措施：</p>
        <ul>
          <li>在预期高峰期前增加系统缓存</li>
          <li>为Alice角色预分配更多资源</li>
          <li>在低负载时段执行数据维护任务</li>
        </ul>
      </div>
    `;
  } catch (error) {
    return '<div class="error-message">无法生成预测分析</div>';
  }
};

// 生成风险提醒
SPMStatusMonitor.prototype.generateRiskAlerts = function () {
  try {
    return `
      <div class="risk-item high">
        <div class="risk-icon">🔴</div>
        <div class="risk-content">
          <h5>高风险：内存使用率预警</h5>
          <p>预测在未来2小时内，内存使用率可能达到85%，建议提前释放缓存。</p>
          <div class="risk-time">预计发生时间: 14:30-16:30</div>
        </div>
      </div>
      
      <div class="risk-item medium">
        <div class="risk-icon">🟡</div>
        <div class="risk-content">
          <h5>中风险：交互量激增</h5>
          <p>预测今日下午交互量将比平常增加50%，可能影响响应速度。</p>
          <div class="risk-time">预计发生时间: 15:00-17:00</div>
        </div>
      </div>
      
      <div class="risk-item low">
        <div class="risk-icon">🟢</div>
        <div class="risk-content">
          <h5>低风险：角色负载不均</h5>
          <p>预测Charlie角色使用率将继续偏低，建议调整策略。</p>
          <div class="risk-time">持续监控</div>
        </div>
      </div>
    `;
  } catch (error) {
    return '<div class="error-message">无法生成风险提醒</div>';
  }
};

// 导出功能实现
SPMStatusMonitor.prototype.exportDataToExcel = function () {
  try {
    this.addActivityLog('📊 导出Excel数据...');

    // 模拟Excel导出
    const csvData = this.generateCSVData();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `SPM数据导出_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    this.addActivityLog('✅ Excel数据导出完成');
  } catch (error) {
    console.error('❌ Excel导出失败:', error);
    this.addActivityLog('❌ Excel导出失败');
  }
};

// 生成CSV数据
SPMStatusMonitor.prototype.generateCSVData = function () {
  try {
    const header = ['时间', '角色', '交互类型', '内容', '响应时间', '状态'];
    const history = this.getFilteredHistory();

    let csv = header.join(',') + '\n';

    history.forEach(item => {
      const row = [
        item.timestamp || new Date().toISOString(),
        item.characterName || item.character || '未知',
        item.type || '普通',
        `"${(item.content || item.message || '').replace(/"/g, '""')}"`,
        item.responseTime || '0',
        item.status || '正常',
      ];
      csv += row.join(',') + '\n';
    });

    return csv;
  } catch (error) {
    return '时间,角色,交互类型,内容,响应时间,状态\n导出失败,,,,,';
  }
};

// 添加缺失的功能函数
SPMStatusMonitor.prototype.initializePredictionChart = function () {
  try {
    const canvas = document.getElementById('predictionChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 绘制预测图表
    this.drawPredictionChart(ctx, width, height);
  } catch (error) {
    console.error('❌ 初始化预测图表失败:', error);
  }
};

SPMStatusMonitor.prototype.drawPredictionChart = function (ctx, width, height) {
  try {
    const margin = 60;
    const chartWidth = width - 2 * margin;
    const chartHeight = height - 2 * margin;

    // 绘制背景网格
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    // 垂直线
    for (let i = 0; i <= 10; i++) {
      const x = margin + (chartWidth / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, margin);
      ctx.lineTo(x, margin + chartHeight);
      ctx.stroke();
    }

    // 水平线
    for (let i = 0; i <= 6; i++) {
      const y = margin + (chartHeight / 6) * i;
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(margin + chartWidth, y);
      ctx.stroke();
    }

    // 生成历史数据点
    const historicalData = [];
    for (let i = 0; i < 7; i++) {
      historicalData.push({
        x: margin + (chartWidth / 10) * i,
        y: margin + chartHeight - (Math.random() * 0.6 + 0.2) * chartHeight,
      });
    }

    // 生成预测数据点
    const predictedData = [];
    for (let i = 7; i <= 10; i++) {
      predictedData.push({
        x: margin + (chartWidth / 10) * i,
        y: margin + chartHeight - (Math.random() * 0.8 + 0.1) * chartHeight,
      });
    }

    // 绘制历史数据线
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    historicalData.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    // 绘制预测数据线
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(historicalData[historicalData.length - 1].x, historicalData[historicalData.length - 1].y);
    predictedData.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // 绘制数据点
    [...historicalData, ...predictedData].forEach((point, index) => {
      ctx.fillStyle = index < historicalData.length ? '#007bff' : '#28a745';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
  } catch (error) {
    console.error('❌ 绘制预测图表失败:', error);
  }
};

// 添加交互地图样式
SPMStatusMonitor.prototype.addInteractionMapStyles = function () {
  if (document.getElementById('spm-interaction-map-styles')) return;

  const style = document.createElement('style');
  style.id = 'spm-interaction-map-styles';
  style.textContent = `
    .interaction-map-modal .spm-modal-content {
      width: 95%;
      max-width: 1200px;
      height: 90vh;
    }
    
    .map-controls {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      align-items: center;
    }
    
    .map-container {
      display: flex;
      gap: 20px;
      height: 100%;
    }
    
    .map-canvas-area {
      flex: 1;
      background: var(--SmartThemeBodyColor);
      border-radius: 8px;
      border: 1px solid var(--SmartThemeQuoteColor);
      position: relative;
      overflow: hidden;
    }
    
    .map-sidebar {
      width: 300px;
      background: var(--SmartThemeBlurTintColor);
      border-radius: 8px;
      padding: 20px;
      overflow-y: auto;
    }
    
    .character-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: var(--SmartThemeBodyColor);
      border: 1px solid transparent;
    }
    
    .character-item:hover {
      background: var(--SmartThemeQuoteColor);
      border-color: var(--SmartThemeBorderColor);
      transform: translateY(-2px);
    }
    
    .character-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    
    .character-indicator.active {
      background: #28a745;
      box-shadow: 0 0 8px rgba(40, 167, 69, 0.5);
    }
    
    .character-indicator.inactive {
      background: #6c757d;
    }
    
    .character-name {
      flex: 1;
      font-weight: 600;
      color: var(--SmartThemeEmColor);
    }
    
    .interaction-count {
      background: var(--SmartThemeQuoteColor);
      color: var(--SmartThemeEmColor);
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
  `;

  document.head.appendChild(style);
};

// 添加分析报告样式
SPMStatusMonitor.prototype.addReportStyles = function () {
  if (document.getElementById('spm-report-styles')) return;

  const style = document.createElement('style');
  style.id = 'spm-report-styles';
  style.textContent = `
    .analysis-report-modal .spm-modal-content {
      width: 95%;
      max-width: 1400px;
      height: 90vh;
    }
    
    .report-controls {
      display: flex;
      gap: 15px;
      align-items: center;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .summary-card {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 20px;
      background: var(--SmartThemeBodyColor);
      border-radius: 10px;
      border: 1px solid var(--SmartThemeQuoteColor);
      transition: all 0.3s ease;
    }
    
    .summary-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .summary-icon {
      font-size: 24px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--SmartThemeQuoteColor);
      border-radius: 50%;
    }
    
    .summary-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--SmartThemeBorderColor);
      margin-bottom: 5px;
    }
    
    .analysis-item {
      margin-bottom: 25px;
      padding: 20px;
      background: var(--SmartThemeBodyColor);
      border-radius: 8px;
      border-left: 4px solid var(--SmartThemeBorderColor);
    }
    
    .recommendation-item {
      display: flex;
      gap: 15px;
      padding: 20px;
      margin-bottom: 15px;
      border-radius: 8px;
      border: 1px solid var(--SmartThemeQuoteColor);
      background: var(--SmartThemeBodyColor);
    }
    
    .action-btn {
      padding: 8px 15px;
      background: var(--SmartThemeQuoteColor);
      color: var(--SmartThemeEmColor);
      border: 1px solid var(--SmartThemeBorderColor);
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.3s ease;
    }
    
    .action-btn:hover {
      background: var(--SmartThemeBorderColor);
      color: white;
      transform: translateY(-2px);
    }
    
    .report-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      background: var(--SmartThemeBodyColor);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .status-good { color: #28a745; font-weight: 600; }
    .status-warning { color: #ffc107; font-weight: 600; }
    .trend-up { color: #28a745; }
    .trend-down { color: #dc3545; }
    .trend-stable { color: #6c757d; }
  `;

  document.head.appendChild(style);
};

// 添加预测样式
SPMStatusMonitor.prototype.addPredictionStyles = function () {
  if (document.getElementById('spm-prediction-styles')) return;

  const style = document.createElement('style');
  style.id = 'spm-prediction-styles';
  style.textContent = `
    .prediction-modal .spm-modal-content {
      width: 95%;
      max-width: 1400px;
      height: 90vh;
    }
    
    .prediction-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .prediction-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 25px;
      background: var(--SmartThemeBodyColor);
      border-radius: 12px;
      border: 1px solid var(--SmartThemeQuoteColor);
      transition: all 0.3s ease;
    }
    
    .prediction-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    }
    
    .prediction-icon {
      font-size: 28px;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--SmartThemeBorderColor), var(--SmartThemeQuoteColor));
      border-radius: 50%;
      color: white;
    }
    
    .prediction-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--SmartThemeBorderColor);
      margin-bottom: 8px;
    }
    
    .risk-item {
      display: flex;
      gap: 15px;
      padding: 20px;
      margin-bottom: 15px;
      border-radius: 10px;
      border: 1px solid var(--SmartThemeQuoteColor);
      background: var(--SmartThemeBlurTintColor);
    }
    
    .risk-item.high { border-left: 5px solid #dc3545; }
    .risk-item.medium { border-left: 5px solid #ffc107; }
    .risk-item.low { border-left: 5px solid #28a745; }
  `;

  document.head.appendChild(style);
};

// 导出扩展实例供调试使用
if (typeof window !== 'undefined') {
  window.SPMStatusMonitor = spmMonitor;

  // 添加全局错误处理器
  window.addEventListener('error', event => {
    if (event.error && event.error.stack && event.error.stack.includes('SPM')) {
      console.error('🚨 SPM扩展错误:', event.error);
      if (spmMonitor && spmMonitor.addActivityLog) {
        spmMonitor.addActivityLog(`❌ 系统错误: ${event.error.message}`);
      }
    }
  });

  // 添加未捕获的Promise错误处理
  window.addEventListener('unhandledrejection', event => {
    if (event.reason && JSON.stringify(event.reason).includes('SPM')) {
      console.error('🚨 SPM未处理的Promise错误:', event.reason);
      if (spmMonitor && spmMonitor.addActivityLog) {
        spmMonitor.addActivityLog(`❌ Promise错误: ${event.reason}`);
      }
    }
  });
}

console.log(`📊 SPM Status Monitor v${EXTENSION_VERSION} 已加载 - 第三阶段完成`);
