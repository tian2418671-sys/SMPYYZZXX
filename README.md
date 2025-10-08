# SPM Status Monitor - SillyTavern Extension

[![Version](https://img.shields.io/badge/version-8.7.0-blue.svg)](https://github.com/tian2418671-sys/SMPYYZZXX)
[![SillyTavern](https://img.shields.io/badge/SillyTavern-Compatible-green.svg)](https://sillytavern.wiki/)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)

> 🚀 专为 SillyTavern 设计的高级角色状态监控扩展

## ✨ 功能特性

### 📊 实时状态监控
- **角色活跃度追踪** - 实时监控角色的互动频率和活跃程度
- **响应时间分析** - 分析 AI 响应速度和性能指标
- **内存使用监控** - 追踪聊天记忆和上下文使用情况
- **系统健康度** - 整体系统运行状态的可视化展示

### 🎯 人格系统分析
- **人格权重监控** - 实时显示当前激活的人格类型
- **人格切换历史** - 追踪人格演化和变化趋势
- **激活统计** - 详细的人格激活次数和使用频率

### 🛠️ 技能系统追踪
- **技能熟练度** - 监控各种技能的掌握程度
- **使用频率统计** - 分析技能使用模式和偏好
- **成功率分析** - 评估技能执行的成功概率

### 📈 数据可视化
- **实时图表** - 动态更新的数据图表和趋势线
- **历史数据** - 长期数据存储和历史回顾功能
- **导出功能** - 支持数据导出为 JSON/CSV 格式

## 🔧 技术特性

### 🌐 跨平台支持
- **响应式设计** - 完美适配桌面端、平板和移动设备
- **触摸优化** - 专门优化的触摸交互体验
- **主题切换** - 支持深色/浅色主题无缝切换

### ⚡ 性能优化
- **轻量级设计** - 仅 520KB 大小，加载速度快
- **低资源占用** - 最小化对系统性能的影响
- **异步处理** - 非阻塞的数据处理和更新机制

### 🔌 SillyTavern 集成
- **原生 API 支持** - 完全兼容 SillyTavern 官方 API
- **事件监听** - 响应聊天、角色切换等核心事件
- **斜杠命令** - 提供 `/spm` 命令快速访问功能
- **函数调用** - 支持 AI 函数调用功能

## 🚀 快速开始

### 安装要求

- SillyTavern 1.12.x 或更高版本
- 现代浏览器 (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### 安装步骤

#### 方法一：直接克隆安装 (推荐)

```bash
# 进入 SillyTavern 扩展目录
cd SillyTavern/public/scripts/extensions/

# 克隆仓库
git clone https://github.com/tian2418671-sys/SMPYYZZXX.git spm-status-monitor

# 重启 SillyTavern
```

#### 方法二：下载ZIP安装

1. 访问 [GitHub仓库](https://github.com/tian2418671-sys/SMPYYZZXX)
2. 点击 "Code" → "Download ZIP"
3. 解压到 `SillyTavern/public/scripts/extensions/spm-status-monitor/`
4. 重启 SillyTavern

#### 方法三：SillyTavern扩展管理器

1. 打开 SillyTavern → Extensions → Manage Extensions
2. 点击 "Install from URL"
3. 输入：`https://github.com/tian2418671-sys/SMPYYZZXX.git`
4. 安装完成后启用扩展

### 启用扩展

1. **启用扩展**
   - 进入 SillyTavern 扩展管理面板
   - 找到并启用 "SPM Status Monitor"
   - 确认版本显示为 v8.7.0

2. **验证安装**
   - 页面右下角应出现 📊 SPM 图标
   - 点击图标测试面板是否正常打开
   - 检查浏览器控制台无错误信息

### 快速配置

```javascript
// 使用斜杠命令快速配置
/spm config theme dark          // 设置深色主题
/spm config update 3000         // 设置更新间隔为3秒
/spm status                     // 查看当前状态
```

## 📖 使用指南

### 基础操作

1. **打开监控面板**
   - 点击右下角的 📊 SPM 图标
   - 或使用斜杠命令 `/spm show`

2. **切换显示模式**
   - **紧凑模式**: 适合小屏幕使用
   - **详细模式**: 显示完整的数据面板
   - **融合模式**: 与 SillyTavern UI 深度集成

3. **数据导出**
   ```bash
   /spm export json    # 导出为 JSON 格式
   /spm export csv     # 导出为 CSV 格式
   ```

### 高级功能

#### 自定义监控指标
```javascript
// 添加自定义监控项
/spm add-metric "response_quality" "响应质量"
/spm set-threshold "response_time" 2000  // 2秒阈值
```

#### 自动化配置
```javascript
// 设置自动报告
/spm auto-report daily    // 每日自动生成报告
/spm alert enable         // 启用异常告警
```

## 🔧 配置选项

### 基础设置
```json
{
  "autoStart": true,              // 自动启动
  "updateInterval": 5000,         // 更新间隔 (毫秒)
  "theme": "auto",               // 主题: auto/dark/light
  "enableNotifications": true,    // 启用通知
  "logLevel": "info"             // 日志级别
}
```

### 监控设置
```json
{
  "trackingMode": "detailed",     // 追踪模式: basic/detailed
  "historyDays": 30,             // 历史数据保存天数
  "realTimeUpdate": true,        // 实时更新
  "performanceMode": false       // 性能模式 (降低资源使用)
}
```

## 🤝 开发与贡献

### 开发环境设置

1. **克隆仓库**
   ```bash
   git clone https://github.com/tian2418671-sys/SMPYYZZXX.git
   cd SMPYYZZXX
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **开发构建**
   ```bash
   npm run dev    # 监听模式构建
   npm run build  # 生产构建
   ```

### 项目结构

```txt
SMPYYZZXX/                   # 扩展根目录
├── manifest.json            # 扩展清单 (必需)
├── index.js                # 主入口文件 (必需)
├── main.js                 # 启动逻辑
├── st-extension.js         # 核心功能实现
├── style.css              # 样式文件 (必需)
├── package.json           # 项目配置
├── .gitignore             # Git忽略文件
├── LICENSE                # 许可证文件
├── README.md              # 项目说明 (本文件)
├── CHANGELOG.md           # 更新日志
├── 安装指南.md            # 详细安装指南
├── 故障排除指南.md        # 问题解决方案
├── 符合性分析报告.md      # 标准符合性分析
└── docs/                  # 文档目录 (可选)
    ├── api/              # API文档
    ├── examples/         # 使用示例
    └── screenshots/      # 截图资源
```

**安装后的目录结构：**
```txt
SillyTavern/public/scripts/extensions/
└── spm-status-monitor/      # 扩展安装目录
    ├── manifest.json        # 从 SMPYYZZXX/ 复制
    ├── index.js            # 从 SMPYYZZXX/ 复制
    ├── st-extension.js     # 从 SMPYYZZXX/ 复制
    ├── style.css           # 从 SMPYYZZXX/ 复制
    └── ...                 # 其他文件
```

### 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📋 更新日志

### v8.7.0 (2025-10-09)
- ✅ 统一版本号管理
- ✅ 完全符合 SillyTavern 官方开发标准
- ✅ 改进错误处理和兼容性检查
- ✅ 优化移动端体验
- ✅ 新增函数调用功能支持

### v8.6.x
- � 修复多设备同步问题
- 📊 改进数据可视化组件
- 🎨 UI/UX 优化

### v8.5.x
- � 初始发布
- 📈 基础监控功能
- 🎯 人格系统集成

## 🐛 问题报告

如果您遇到问题，请：

1. 检查 [常见问题解答](./docs/FAQ.md)
2. 搜索 [已知问题](https://github.com/tian2418671-sys/SMPYYZZXX/issues)
3. 创建新的 [Issue](https://github.com/tian2418671-sys/SMPYYZZXX/issues/new)

提交问题时请包含：
- SillyTavern 版本
- 浏览器信息
- 错误截图或日志
- 重现步骤

## 📞 技术支持

- **文档**: [在线文档](https://github.com/tian2418671-sys/SMPYYZZXX/wiki)
- **社区**: [GitHub Discussions](https://github.com/tian2418671-sys/SMPYYZZXX/discussions)
- **邮件**: <tian2418671@example.com>

## � 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

## 🙏 致谢

- SillyTavern 开发团队提供的优秀平台
- 社区用户的反馈和建议
- 所有贡献者的努力

---

**⭐ 如果这个项目对您有帮助，请给我们一个星标！**

*让我们一起打造更好的 AI 交互体验！* 🚀
