---
title: "机器学习中的数学公式测试"
date: 2025-03-13
updated: 2025-07-22
tags: [机器学习, 数学, 公式测试]
author: "测试者"
cover: "/styles/images/Cloud.jpg"
featured: false
---

## 基础符号与上下标

---

- 变量与下标：$x_i, y_j, z_{k+1}$
- 上标与幂运算：$a^2, b^n, e^{kx}, 2^{i+j}$
- 混合上下标：$x^m_n, \theta^{t+1}_i, \alpha^{(\ell)}_{j}$
- 希腊字母：$\alpha, \beta, \gamma, \delta, \epsilon, \lambda, \mu, \sigma, \omega$
- 大写希腊字母：$\Lambda, \Sigma, \Omega, \Delta$

---

## 线性代数

---

- 向量：$\mathbf{x}, \mathbf{y}, \mathbf{w} = (w_1, w_2, ..., w_n)^T$
- 矩阵：$\mathbf{A}, \mathbf{B}, \mathbf{X} \in \mathbb{R}^{m \times n}$
- 矩阵乘法：$\mathbf{C} = \mathbf{A} \mathbf{B}$，其中 $C_{ij} = \sum_{k=1}^n A_{ik} B_{kj}$
- 转置：$\mathbf{A}^T, (\mathbf{x} \mathbf{y}^T)^T$
- 逆矩阵：$\mathbf{A}^{-1}, (\mathbf{B}^T \mathbf{B})^{-1}$
- 特征值与特征向量：$\mathbf{A} \mathbf{v} = \lambda \mathbf{v}$

---

## 微积分

---

- 导数：$\frac{dy}{dx}, \frac{\partial f}{\partial x_i}, \nabla f(x)$
- 偏导数：$\frac{\partial L}{\partial \theta}, \frac{\partial^2 J}{\partial w \partial b}$
- 梯度：$\nabla J(\theta) = \left( \frac{\partial J}{\partial \theta_1}, \frac{\partial J}{\partial \theta_2}, ..., \frac{\partial J}{\partial \theta_n} \right)^T$
- 积分：$\int_a^b f(x) dx, \iint_D g(x,y) dxdy, \int_{-\infty}^\infty e^{-x^2} dx = \sqrt{\pi}$

---

## 机器学习核心公式

---

- 线性回归：$h_\theta(x) = \theta_0 + \theta_1 x_1 + ... + \theta_n x_n = \theta^T \mathbf{x}$
- 逻辑回归：$h_\theta(x) = \frac{1}{1 + e^{-\theta^T \mathbf{x}}}$
- 损失函数：$L(y, \hat{y}) = -(y \log \hat{y} + (1-y) \log (1-\hat{y}))$
- 梯度下降更新：$\theta_j = \theta_j - \eta \frac{\partial J(\theta)}{\partial \theta_j}$
- softmax 函数：$\sigma(\mathbf{z})_i = \frac{e^{z_i}}{\sum_{k=1}^K e^{z_k}}$
- 卷积操作：$(f * g)(x) = \int_{-\infty}^\infty f(t) g(x-t) dt$

---

## 概率与统计

---

- 概率分布：$P(X=x), p(y | x; \theta), \mathcal{N}(\mu, \sigma^2)$
- 期望与方差：$\mathbb{E}[X], \text{Var}(X) = \mathbb{E}[X^2] - (\mathbb{E}[X])^2$
- 贝叶斯公式：$P(A|B) = \frac{P(B|A) P(A)}{P(B)}$

---

## 复杂公式块

---

$$
\min_{\theta} J(\theta) = \frac{1}{m} \sum_{i=1}^m L(h_\theta(x^{(i)}), y^{(i)}) + \lambda \sum_{j=1}^n \theta_j^2
$$

$$
\mathbf{W}^* = \arg \min_{\mathbf{W}} \left\| \mathbf{X} - \mathbf{W} \mathbf{H} \right\|_F^2 + \lambda \|\mathbf{W}\|_1
$$

$$
\begin{bmatrix}
a_{11} & a_{12} & \dots & a_{1n} \\
a_{21} & a_{22} & \dots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{m1} & a_{m2} & \dots & a_{mn}
\end{bmatrix}
\begin{bmatrix}
x_1 \\
x_2 \\
\vdots \\
x_n
\end{bmatrix}
=
\begin{bmatrix}
b_1 \\
b_2 \\
\vdots \\
b_m
\end{bmatrix}
$$

---
