import React, { useEffect, useRef } from 'react'
import { Trash2, Download, Copy, ArrowDown } from 'lucide-react'
import { PageHeader } from '../../layout/PageHeader'
import { Button, Card, CardContent } from '../../ui'
import { useDownloadStore } from '../../../stores/downloadStore'

export function ConsolePage() {
  const { consoleMessages, clearConsole } = useDownloadStore()
  const consoleRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = React.useState(true)

  useEffect(() => {
    if (autoScroll && consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [consoleMessages, autoScroll])

  const handleScroll = () => {
    if (consoleRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = consoleRef.current
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
      setAutoScroll(isAtBottom)
    }
  }

  const handleCopy = async () => {
    const text = consoleMessages.map(m => m.content).join('\n')
    await navigator.clipboard.writeText(text)
  }

  const handleExport = () => {
    const text = consoleMessages.map(m =>
      `[${m.timestamp.toISOString()}] [${m.type.toUpperCase()}] ${m.content}`
    ).join('\n')

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sldl-console-${new Date().toISOString().slice(0, 10)}.log`
    a.click()
    URL.revokeObjectURL(url)
  }

  const scrollToBottom = () => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
      setAutoScroll(true)
    }
  }

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-destructive'
      case 'warning':
        return 'text-warning'
      case 'success':
        return 'text-success'
      default:
        return 'text-foreground'
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Console"
        description="View sldl output and logs"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={clearConsole}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </>
        }
      />

      <div className="flex-1 min-h-0 overflow-hidden p-6">
        <Card className="h-full flex flex-col overflow-hidden">
          <CardContent className="flex-1 min-h-0 p-0 relative overflow-hidden">
            <div
              ref={consoleRef}
              onScroll={handleScroll}
              className="absolute inset-0 overflow-auto p-4 font-mono text-sm bg-muted/30"
              role="log"
              aria-live="polite"
              aria-label="Console output"
            >
              {consoleMessages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No console output yet. Start a download to see output here.
                </p>
              ) : (
                consoleMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`py-0.5 ${getMessageColor(message.type)}`}
                  >
                    <span className="text-muted-foreground text-xs mr-2">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="whitespace-pre-wrap break-all">
                      {message.content}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Scroll to bottom button */}
            {!autoScroll && consoleMessages.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={scrollToBottom}
                className="absolute bottom-4 right-4 shadow-lg"
              >
                <ArrowDown className="h-4 w-4 mr-1" />
                Scroll to bottom
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

