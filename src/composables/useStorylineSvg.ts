import { watch, nextTick, type Ref } from 'vue'
import svgPanZoom from 'svg-pan-zoom'
import { useScenarioStore } from '@/stores/scenarioStore'
import { useFlowchartStore } from '@/stores/flowchartStore'
import { ScenarioStatus } from '@/models/types'
import storylineSvgRaw from '@/assets/storylines/gh.svg?raw'

/** Maps our scenario statuses to SVG CSS class names */
const STATUS_CLASS_MAP: Record<string, string> = {
  [ScenarioStatus.COMPLETED]: 'complete',
  [ScenarioStatus.AVAILABLE]: 'incomplete',
  [ScenarioStatus.BLOCKED]: 'blocked',
  [ScenarioStatus.REQUIRED]: 'required',
  [ScenarioStatus.ATTEMPTED]: 'attempted',
}

const STATE_CLASSES = ['complete', 'incomplete', 'blocked', 'required', 'attempted'] as const

export function useStorylineSvg(containerRef: Ref<HTMLElement | null>) {
  const scenarioStore = useScenarioStore()
  const flowchartStore = useFlowchartStore()
  let panZoomInstance: ReturnType<typeof svgPanZoom> | null = null
  let previousSelectedNode: Element | null = null

  function getSvgEl(): SVGSVGElement | null {
    return containerRef.value?.querySelector('svg') ?? null
  }

  function queryNode(id: string): Element | null {
    return containerRef.value?.querySelector(`#node${id}`) ?? null
  }

  function queryEdge(fromId: string, toId: string): Element | null {
    return containerRef.value?.querySelector(`#edge${fromId}-${toId}`) ?? null
  }

  function queryChapter(id: string): Element | null {
    return containerRef.value?.querySelector(`#chapter${id}`) ?? null
  }

  // ViewBox values matching gloomhaven-storyline reference
  const VIEWBOX = {
    portrait: '0 -70 420 1080',
    landscape: '0 -40 610 700',
  }

  // ── Init ──

  function initSvg() {
    const container = containerRef.value
    if (!container) return

    // Insert raw SVG
    container.innerHTML = storylineSvgRaw

    const svg = getSvgEl()
    if (!svg) return

    // Remove portrait or landscape groups based on screen orientation
    const isPortrait = window.innerHeight > window.innerWidth
    const removeClass = isPortrait ? 'landscape' : 'portrait'
    const toRemove = container.querySelectorAll(`g.${removeClass}`)
    for (const el of toRemove) {
      el.remove()
    }

    // Set correct viewBox for orientation
    svg.setAttribute('viewBox', isPortrait ? VIEWBOX.portrait : VIEWBOX.landscape)

    // Attach click listeners
    container.addEventListener('click', handleClick)

    // Mobile touch: tap detection + smooth pinch-to-zoom
    let touchStartTarget: EventTarget | null = null
    let touchStartX = 0
    let touchStartY = 0
    let isPinching = false
    let lastPinchDist = 0
    const TAP_THRESHOLD = 15 // px — finger wobble tolerance

    container.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartTarget = e.target
        touchStartX = e.touches[0].clientX
        touchStartY = e.touches[0].clientY
      }
      if (e.touches.length === 2) {
        isPinching = true
        lastPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
      }
    }, { passive: true })

    container.addEventListener('touchmove', (e: TouchEvent) => {
      // Smooth pinch-to-zoom using zoomAtPointBy
      if (e.touches.length === 2 && panZoomInstance && lastPinchDist > 0) {
        e.preventDefault()
        isPinching = true
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        const scale = dist / lastPinchDist
        if (Math.abs(scale - 1) > 0.01) {
          // Zoom at the midpoint between two fingers
          const svg = getSvgEl()
          if (svg) {
            const rect = svg.getBoundingClientRect()
            const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left
            const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top
            panZoomInstance.zoomAtPointBy(scale, { x: midX, y: midY })
          }
          lastPinchDist = dist
        }
      }
    }, { passive: false })

    container.addEventListener('touchend', (e: TouchEvent) => {
      if (e.touches.length === 0) {
        // Tap detection (only if it wasn't a pinch gesture)
        if (!isPinching && touchStartTarget) {
          const endX = e.changedTouches[0].clientX
          const endY = e.changedTouches[0].clientY
          const dist = Math.hypot(endX - touchStartX, endY - touchStartY)

          if (dist < TAP_THRESHOLD) {
            const target = touchStartTarget as Element
            const scenarioEl = target.closest?.('.scenario')
            if (scenarioEl) {
              e.preventDefault()
              e.stopPropagation()
              handleClick({ target } as unknown as Event)
            }
          }
        }
        touchStartTarget = null
        isPinching = false
        lastPinchDist = 0
      }
    })

    // Initial render
    nextTick(() => {
      renderAll()
      initPanZoom()
    })
  }

  function initPanZoom() {
    const svg = getSvgEl()
    if (!svg) return

    panZoomInstance = svgPanZoom(svg, {
      zoomEnabled: true,
      panEnabled: true,
      controlIconsEnabled: false,
      mouseWheelZoomEnabled: true,
      dblClickZoomEnabled: true,
      minZoom: 0.5,
      maxZoom: 4,
      zoomScaleSensitivity: 0.3,
      fit: true,
      center: true,
      beforePan(_oldPan, newPan) {
        const gutter = 100
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sizes = (this as any).getSizes()
        const vb = sizes.viewBox
        const leftLimit = -((vb.x + vb.width) * sizes.realZoom) + gutter
        const rightLimit = sizes.width - gutter - (vb.x * sizes.realZoom)
        const topLimit = -((vb.y + vb.height) * sizes.realZoom) + gutter
        const bottomLimit = sizes.height - gutter - (vb.y * sizes.realZoom)
        return {
          x: Math.max(leftLimit, Math.min(rightLimit, newPan.x)),
          y: Math.max(topLimit, Math.min(bottomLimit, newPan.y)),
        }
      },
    })
  }

  // ── Click handling ──

  function handleClick(e: Event) {
    const target = e.target as Element
    // Walk up to find .scenario group
    const scenarioEl = target.closest('.scenario')
    if (!scenarioEl) return

    const nodeId = scenarioEl.id?.replace('node', '')
    if (!nodeId) return

    // Update selection styling
    if (previousSelectedNode) {
      previousSelectedNode.classList.remove('selected')
    }
    scenarioEl.classList.add('selected')
    previousSelectedNode = scenarioEl

    flowchartStore.selectNode(nodeId)
  }

  // ── Render ──

  function renderAll() {
    renderScenarios()
    renderEdges()
    renderChapters()
  }

  function renderScenarios() {
    const container = containerRef.value
    if (!container) return

    const statuses = scenarioStore.computedStatuses
    const storyFilter = flowchartStore.storyFilter
    const statusFilter = flowchartStore.filterStatus

    for (const scenario of scenarioStore.scenarioDefinitions) {
      const node = queryNode(scenario.id)
      if (!node) continue

      const el = node as HTMLElement
      const status = statuses[scenario.id] ?? ScenarioStatus.LOCKED
      const isHiddenOrLocked =
        status === ScenarioStatus.HIDDEN || status === ScenarioStatus.LOCKED

      // Story filter
      const storyHidden =
        (storyFilter === 'main' && scenario.isSide) ||
        (storyFilter === 'side' && !scenario.isSide)

      // Status filter
      const statusHidden =
        statusFilter !== 'all' && status !== statusFilter

      // Remove old state classes
      for (const cls of STATE_CLASSES) {
        node.classList.remove(cls)
      }
      node.classList.remove('opacity-50')

      // Side scenarios: ALWAYS visible, but dimmed when hidden/locked
      // Main scenarios: hidden when locked/hidden
      if (storyHidden || statusHidden) {
        el.style.display = 'none'
        continue
      }

      if (scenario.isSide) {
        // Side scenarios always shown
        el.style.display = ''
        if (isHiddenOrLocked) {
          // Dimmed appearance for locked side scenarios
          node.classList.add('opacity-50')
        } else {
          const stateClass = STATUS_CLASS_MAP[status]
          if (stateClass) {
            node.classList.add(stateClass)
          }
        }
      } else {
        // Main scenarios: hide if locked/hidden
        if (isHiddenOrLocked) {
          el.style.display = 'none'
          continue
        }
        el.style.display = ''
        const stateClass = STATUS_CLASS_MAP[status]
        if (stateClass) {
          node.classList.add(stateClass)
        }
      }

      // Add tooltip if not already present
      if (!node.querySelector('title')) {
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
        title.textContent = `${scenario.id}. ${scenario.name}`
        node.insertBefore(title, node.firstChild)
      }
    }
  }

  function renderEdges() {
    const container = containerRef.value
    if (!container) return

    const statuses = scenarioStore.computedStatuses

    // First hide all edges
    const allEdges = container.querySelectorAll('.edge')
    for (const edge of allEdges) {
      ;(edge as HTMLElement).style.display = 'none'
      edge.classList.remove('visible')
    }

    // Show edges for completed scenarios
    for (const scenario of scenarioStore.scenarioDefinitions) {
      const status = statuses[scenario.id]
      if (status !== ScenarioStatus.COMPLETED) continue

      // Story filter — hide edges for filtered-out scenarios
      const storyFilter = flowchartStore.storyFilter
      if (storyFilter === 'main' && scenario.isSide) continue
      if (storyFilter === 'side' && !scenario.isSide) continue

      // If scenario has choices, only show edges for chosen path
      if (scenario.choices && scenario.choices.length > 0) {
        const state = scenarioStore.getState(scenario.id)
        if (state.choice) {
          const choiceIds = String(state.choice).split(',')
          for (const choiceId of choiceIds) {
            const edge = queryEdge(scenario.id, choiceId.trim())
            if (edge) {
              ;(edge as HTMLElement).style.display = ''
              edge.classList.add('visible')
            }
          }
        }
        continue
      }

      // Show all outgoing edges
      for (const targetId of scenario.linksTo) {
        const edge = queryEdge(scenario.id, String(targetId))
        if (edge) {
          ;(edge as HTMLElement).style.display = ''
          edge.classList.add('visible')
        }
      }

      // Show treasure-linked edges
      if (scenario.treasuresTo) {
        for (const [treasureId, targetIds] of Object.entries(scenario.treasuresTo)) {
          const state = scenarioStore.getState(scenario.id)
          if (state.treasuresLooted.includes(treasureId)) {
            for (const targetId of targetIds) {
              const edge = queryEdge(scenario.id, String(targetId))
              if (edge) {
                ;(edge as HTMLElement).style.display = ''
                edge.classList.add('visible')
              }
            }
          }
        }
      }
    }
  }

  function renderChapters() {
    const container = containerRef.value
    if (!container) return

    const statuses = scenarioStore.computedStatuses

    // Main chapters (1-10): show if any scenario in chapter is completed
    for (let i = 1; i <= 10; i++) {
      const chapter = queryChapter(String(i))
      if (!chapter) continue

      if (i === 1) {
        // Intro chapter always visible
        ;(chapter as HTMLElement).style.display = ''
        continue
      }

      const hasCompleted = scenarioStore.scenarioDefinitions.some(
        (s) =>
          s.chapterId === i &&
          statuses[s.id] === ScenarioStatus.COMPLETED
      )

      ;(chapter as HTMLElement).style.display = hasCompleted ? '' : 'none'
    }

    // Side chapters (101-105): show if story filter allows and any scenario is not hidden
    const storyFilter = flowchartStore.storyFilter
    for (const chapterId of [101, 102, 103, 104, 105]) {
      const chapter = queryChapter(String(chapterId))
      if (!chapter) continue

      if (storyFilter === 'main') {
        ;(chapter as HTMLElement).style.display = 'none'
        continue
      }

      // Show if any scenario in this chapter exists and is not hidden
      const hasVisible = scenarioStore.scenarioDefinitions.some(
        (s) =>
          s.chapterId === chapterId &&
          statuses[s.id] !== ScenarioStatus.HIDDEN
      )

      // Side scenarios are always visible in the SVG, so always show their chapters
      ;(chapter as HTMLElement).style.display = hasVisible || storyFilter === 'side' ? '' : 'none'
    }
  }

  // ── Watch for changes ──

  watch(
    () => scenarioStore.computedStatuses,
    () => renderAll(),
    { deep: true }
  )

  watch(
    [() => flowchartStore.filterStatus, () => flowchartStore.storyFilter],
    () => renderAll()
  )

  // Deselect when detail panel closes
  watch(
    () => flowchartStore.selectedNodeId,
    (newId) => {
      if (!newId && previousSelectedNode) {
        previousSelectedNode.classList.remove('selected')
        previousSelectedNode = null
      }
    }
  )

  // ── Public API ──

  function fitView() {
    panZoomInstance?.resetZoom()
    panZoomInstance?.resetPan()
  }

  function destroy() {
    containerRef.value?.removeEventListener('click', handleClick)
    panZoomInstance?.destroy()
    panZoomInstance = null
  }

  return { initSvg, fitView, destroy }
}
