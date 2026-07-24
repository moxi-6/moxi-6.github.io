# Verilog 仿真行为与编码风格

<div class="page-meta">E5 · 01　状态：已完成并整理</div>

Verilog 描述的是并行硬件行为。理解事件调度，才能解释阻塞与非阻塞赋值、数据竞争和仿真输出。

## 配套实践

已经完成：

- Verilator 官方 C++ 示例；
- 双控开关仿真与随机断言；
- VCD / FST 波形生成与 GTKWave 查看；
- Makefile 一键仿真；
- NVBoard 双控开关与流水灯；
- Verilator 静态检查；
- 查看 Verilator 生成的 C++ 调度代码。

### 流水灯核心代码

```verilog
module light(
  input clk,
  input rst,
  output reg [15:0] led
);
  reg [31:0] count;

  always @(posedge clk) begin
    if (rst) begin
      led <= 1;
      count <= 0;
    end else begin
      if (count == 0)
        led <= {led[14:0], led[15]};
      count <= (count >= 5000000 ? 32'b0 : count + 1);
    end
  end
endmodule
```

这段代码满足几个重要规范：时序逻辑使用非阻塞赋值；`led` 与 `count` 各自由唯一过程驱动；同一时序块不混用 `=` 与 `<=`；没有使用 `#0`。

## Verilog 代码如何执行

`initial`、`always`、连续赋值和模块实例可以同时工作，不能按 C 语言单线程、从上到下的方式理解整个设计。

一次赋值可以拆成两个动作：

- **求值**：读取右侧表达式并计算结果；
- **更新**：把结果写入左侧变量。

分析代码时必须区分：哪些顺序由语言标准保证，哪些顺序在并行过程之间并不确定。

## 基于事件的仿真

信号变化、过程触发、表达式求值和变量更新都可以看成事件。

```text
信号变化
  ↓
触发敏感过程
  ↓
过程求值
  ↓
产生更新事件
  ↓
更新信号
```

仿真器会反复处理事件，直到当前仿真时刻不再产生新事件，然后才进入下一个仿真时刻。

### 层次化事件队列

```text
Active → Inactive → NBA → Monitor → 下一仿真时刻
```

| 区域 | 典型内容 |
|---|---|
| Active | 普通过程求值、阻塞赋值、`$display` |
| Inactive | 显式 `#0` 后的操作 |
| NBA | 非阻塞赋值 `<=` 的左侧更新 |
| Monitor | `$strobe`、`$monitor` |
| Future | 未来仿真时刻的事件，如 `#5` |

`$display` 在 Active 区域，常看到旧值；非阻塞赋值在 NBA 更新；`$strobe` 在 Monitor 区域，看到本时刻稳定后的新值。

## 阻塞与非阻塞赋值

| 特性 | 阻塞赋值 `=` | 非阻塞赋值 `<=` |
|---|---|---|
| 右侧求值 | 立即 | 立即 |
| 左侧更新 | 立即 | 放入 NBA |
| 典型用途 | 组合逻辑 | 时序逻辑 |

### 混合赋值例题

```verilog
always @(posedge clk) begin
  b  = a;
  c <= b;
  d  = c;
  e <= d;
  a  = e;
end
```

初始值为 `a=1 b=2 c=3 d=4 e=5`。逐句执行后，NBA 更新前已经得到 `b=1, d=3, a=5`；NBA 最后更新 `c=1, e=3`。

```text
a=5 b=1 c=1 d=3 e=3
```

快速判断：遇到 `=` 立即修改当前值；遇到 `<=` 立即计算右侧，把左侧更新记入 NBA；过程结束后再执行 NBA 更新。

## 确定与不确定的顺序

### 不确定

- 不同 `always` 或 `initial` 之间没有默认先后顺序；
- 不能根据代码在文件中的上下位置推断不同过程谁先执行；
- 同一区域内多个独立事件的顺序可能不确定。

### 确定

- 同一个 `begin-end` 内按书写顺序执行；
- Active 早于 NBA，NBA 早于 Monitor；
- 同一个顺序块中连续生成的 NBA 更新保持语句顺序。

## Verilator 的实现方式

事件队列是语言语义模型，仿真器内部不一定真的维护一个同名队列。Verilator 会把电路转换为 C++，常用“当前状态 / 下一状态临时变量 / 统一写回”实现非阻塞赋值语义。

```text
读取当前状态 → 计算下一状态 → 统一写回
```

上升沿检测可以简化为：

```cpp
trigger = current_clk & !previous_clk;
previous_clk = current_clk;
```

只有时钟从 `0` 变成 `1` 时，才触发 `always @(posedge clk)`。

## 数据竞争

两个操作同时满足以下条件时存在数据竞争：

1. 执行顺序不确定；
2. 访问同一个变量，且至少一个操作会写入。

```verilog
always @(posedge clk) a = b;
always @(posedge clk) b = a;
```

旧值 `a=0, b=1` 时，不同执行顺序可能得到 `(1,1)` 或 `(0,0)`。

```verilog
always @(posedge clk) a <= b;
always @(posedge clk) b <= a;
```

改用非阻塞赋值后，两个过程都读取旧状态，再统一更新，确定得到 `a=1, b=0`。但这并不意味着多个过程可以合理地同时驱动同一个变量。

## 编码风格

1. 时序电路使用非阻塞赋值 `<=`；
2. 组合逻辑使用阻塞赋值 `=`；
3. 同一个 `always` 中不要混用两类赋值；
4. 不要在多个 `always` 中给同一个变量赋值；
5. 用 `$strobe` 或波形观察 NBA 后的稳定值；
6. 不要使用 `#0` 人为调整事件顺序。

> 组合逻辑用 `=`，时序逻辑用 `<=`；一个变量只由一个过程驱动。
