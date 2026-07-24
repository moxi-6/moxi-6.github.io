# 一生一芯学习总览

“一生一芯”学习的重点不是只得到最终电路或代码，而是建立从软件到硬件的完整理解。

<div class="note-grid">
  <div><strong>当前阶段</strong><span>E5 / F6</span></div>
  <div><strong>主要工具</strong><span>Linux · Logisim · Verilator</span></div>
  <div><strong>核心目标</strong><span>实现并验证 RISC-V 处理器</span></div>
</div>

## 学习记录

| 模块 | 内容 | 状态 |
|---|---|---|
| E5 | Verilator 与基础硬件开发流程 | 进行中 |
| F5 | 数字电路和处理器基础组件 | 整理中 |
| F6 | 功能完备的迷你 RISC-V 处理器 | 调试中 |

## 调试原则

1. 先确认测试程序和预期结果；
2. 再确认 PC、指令和寄存器写回；
3. 按单条指令追踪数据通路；
4. 不凭感觉修改，所有修改都要重新跑测试；
5. 最终结果与讲义要求一致后再认为完成。
