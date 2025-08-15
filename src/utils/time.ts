import { format, formatDistanceToNow } from "date-fns";
import zhCN from "date-fns/locale/zh-CN";

// 验证日期是否有效
function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

export function formatDate(date: Date | string, formatStr: string) {
  try {
    const dateObj = new Date(date);
    if (!isValidDate(dateObj)) {
      console.warn("无效的日期:", date);
      return "未知日期";
    }
    return format(dateObj, formatStr, { locale: zhCN });
  } catch (err) {
    console.error("格式化日期时出错:", err, date);
    return "未知日期";
  }
}

export function formatRelativeTime(date: Date | string) {
  try {
    const dateObj = new Date(date);
    if (!isValidDate(dateObj)) {
      console.warn("无效的日期:", date);
      return "未知时间";
    }
    return formatDistanceToNow(dateObj, {
      locale: zhCN,
      addSuffix: true,
    });
  } catch (err) {
    console.error("计算相对时间时出错:", err, date);
    return "未知时间";
  }
}

export function formatRelativeDate(date: Date | string) {
  try {
    const dateObj = new Date(date);
    if (!isValidDate(dateObj)) {
      console.warn("无效的日期:", date);
      return "未知日期";
    }

    // 获取当前日期（仅年月日）
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 目标日期（仅年月日）
    const targetDate = new Date(dateObj);
    targetDate.setHours(0, 0, 0, 0);

    // 关键修复：计算天数差（当前日期 - 目标日期）
    // 之前可能颠倒了相减的顺序
    const diffTime = today.getTime() - targetDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 根据差值返回相对日期
    if (diffDays === 0) {
      return "今天";
    } else if (diffDays === 1) {
      return "昨天";
    } else if (diffDays > 1) {
      return `${diffDays}天前`;
    } else {
      // 未来日期处理
      const futureDays = Math.abs(diffDays);
      return futureDays === 1 ? "明天" : `${futureDays}天后`;
    }
  } catch (err) {
    console.error("计算相对日期时出错:", err, date);
    return "未知日期";
  }
}
