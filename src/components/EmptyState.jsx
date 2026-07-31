export function EmptyState({ hasFilters }) {
  return (
    <div className="empty-state">
      <h3>{hasFilters ? '没有符合条件的摘录' : '空白的一页'}</h3>
      <p>
        {hasFilters
          ? '试试换一个关键词，或清除已选的标签。'
          : '点击右上角「+ 新建摘抄」，留下第一段值得铭记的文字。'}
      </p>
    </div>
  )
}
