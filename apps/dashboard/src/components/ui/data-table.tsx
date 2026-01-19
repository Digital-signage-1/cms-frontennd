import { useState } from 'react'

interface Column<T> {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  selectable?: boolean
  onRowClick?: (row: T) => void
}

export function DataTable<T extends { id: string }>({ 
  data, 
  columns, 
  selectable = false,
  onRowClick 
}: DataTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.map(row => row.id)))
    }
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-surface border-b border-border-subtle">
          <tr className="h-10">
            {selectable && (
              <th className="w-12 px-4">
                <input
                  type="checkbox"
                  checked={selectedIds.size === data.length && data.length > 0}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-border"
                />
              </th>
            )}
            {columns.map(column => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className="px-4 text-left text-xs font-medium uppercase tracking-wider text-text-muted"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {data.map(row => (
            <tr 
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`h-13 hover:bg-surface-alt transition-colors ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
            >
              {selectable && (
                <td className="px-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={() => toggleRow(row.id)}
                    className="h-4 w-4 rounded border-border"
                  />
                </td>
              )}
              {columns.map(column => (
                <td key={column.key} className="px-4 py-3 text-sm text-text-primary">
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
