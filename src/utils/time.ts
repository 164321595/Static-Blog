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
