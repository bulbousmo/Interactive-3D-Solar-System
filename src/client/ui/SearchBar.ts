import { planets } from '../data/planets'
import { moons }   from '../data/moons'

const ALL_NAMES: string[] = [
    'Sun',
    ...planets.map(p => p.name),
    ...moons.map(m => m.name),
]

const CSS = `
.sb-wrap {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 200;
    width: 280px;
    font-family: sans-serif;
}
.sb-input-row {
    display: flex;
    align-items: center;
    background: rgba(10, 12, 28, 0.88);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    padding: 0 12px;
    gap: 8px;
}
.sb-input-row:focus-within {
    border-color: rgba(255,255,255,0.4);
}
.sb-icon {
    color: rgba(255,255,255,0.4);
    font-size: 14px;
    flex-shrink: 0;
    pointer-events: none;
}
.sb-input {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: #fff;
    font-size: 14px;
    padding: 10px 0;
    caret-color: #fff;
}
.sb-input::placeholder { color: rgba(255,255,255,0.3); }
.sb-clear {
    background: none;
    border: none;
    color: rgba(255,255,255,0.3);
    cursor: pointer;
    font-size: 16px;
    padding: 0;
    line-height: 1;
    flex-shrink: 0;
}
.sb-clear:hover { color: rgba(255,255,255,0.7); }
.sb-dropdown {
    margin-top: 4px;
    background: rgba(10, 12, 28, 0.95);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    overflow: hidden;
    display: none;
}
.sb-dropdown.open { display: block; }
.sb-item {
    padding: 9px 14px;
    font-size: 13px;
    color: rgba(255,255,255,0.75);
    cursor: pointer;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.sb-item:last-child { border-bottom: none; }
.sb-item:hover, .sb-item.active {
    background: rgba(255,255,255,0.08);
    color: #fff;
}
.sb-item-type {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: rgba(255,255,255,0.3);
}
`

export class SearchBar {
    private wrap:      HTMLDivElement
    private input:     HTMLInputElement
    private dropdown:  HTMLDivElement
    private onSelect:  (name: string) => void
    private activeIdx: number = -1
    private matches:   string[] = []

    constructor(onSelect: (name: string) => void) {
        this.onSelect = onSelect

        const style = document.createElement('style')
        style.textContent = CSS
        document.head.appendChild(style)

        // ── wrapper ───────────────────────────────────────────────────────────
        this.wrap = document.createElement('div')
        this.wrap.className = 'sb-wrap'

        // ── input row ─────────────────────────────────────────────────────────
        const row = document.createElement('div')
        row.className = 'sb-input-row'

        const icon = document.createElement('span')
        icon.className = 'sb-icon'
        icon.textContent = '🔍'

        this.input = document.createElement('input')
        this.input.className  = 'sb-input'
        this.input.type        = 'text'
        this.input.placeholder = 'Search planets & moons…'
        this.input.spellcheck  = false

        const clearBtn = document.createElement('button')
        clearBtn.className   = 'sb-clear'
        clearBtn.textContent = '×'
        clearBtn.title       = 'Clear'
        clearBtn.addEventListener('click', () => this.clear())

        row.append(icon, this.input, clearBtn)

        // ── dropdown ──────────────────────────────────────────────────────────
        this.dropdown = document.createElement('div')
        this.dropdown.className = 'sb-dropdown'

        this.wrap.append(row, this.dropdown)
        document.body.appendChild(this.wrap)

        // ── events ────────────────────────────────────────────────────────────
        this.input.addEventListener('input',   () => this.onInput())
        this.input.addEventListener('keydown', (e) => this.onKeyDown(e))
        this.input.addEventListener('blur',    () => {
            // Short delay so a dropdown click can fire before the dropdown hides
            setTimeout(() => this.closeDropdown(), 150)
        })

        // Press '/' anywhere (when not typing) to focus the search bar
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Slash' && document.activeElement !== this.input) {
                e.preventDefault()
                this.input.focus()
            }
        })
    }

    private onInput(): void {
        const q = this.input.value.trim().toLowerCase()
        if (!q) { this.closeDropdown(); return }

        this.matches   = ALL_NAMES.filter(n => n.toLowerCase().includes(q))
        this.activeIdx = -1
        this.renderDropdown()
    }

    private onKeyDown(e: KeyboardEvent): void {
        if (e.key === 'Escape') { this.clear(); return }

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            this.activeIdx = Math.min(this.activeIdx + 1, this.matches.length - 1)
            this.highlightActive()
            return
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            this.activeIdx = Math.max(this.activeIdx - 1, 0)
            this.highlightActive()
            return
        }
        if (e.key === 'Enter') {
            const name = this.activeIdx >= 0
                ? this.matches[this.activeIdx]
                : this.matches[0]
            if (name) this.select(name)
        }
    }

    private renderDropdown(): void {
        this.dropdown.innerHTML = ''

        if (this.matches.length === 0) {
            this.closeDropdown()
            return
        }

        this.matches.slice(0, 8).forEach((name, i) => {
            const item = document.createElement('div')
            item.className = 'sb-item'
            if (i === this.activeIdx) item.classList.add('active')

            const label = document.createElement('span')
            label.textContent = name

            const type = document.createElement('span')
            type.className   = 'sb-item-type'
            type.textContent = this.typeLabel(name)

            item.append(label, type)
            item.addEventListener('mousedown', () => this.select(name))
            this.dropdown.appendChild(item)
        })

        this.dropdown.classList.add('open')
    }

    private highlightActive(): void {
        const items = this.dropdown.querySelectorAll<HTMLDivElement>('.sb-item')
        items.forEach((el, i) => el.classList.toggle('active', i === this.activeIdx))
    }

    private select(name: string): void {
        this.onSelect(name)
        this.clear()
    }

    private clear(): void {
        this.input.value = ''
        this.input.blur()
        this.closeDropdown()
    }

    private closeDropdown(): void {
        this.dropdown.classList.remove('open')
        this.matches   = []
        this.activeIdx = -1
    }

    private typeLabel(name: string): string {
        if (name === 'Sun') return 'Star'
        if (planets.some(p => p.name === name)) return 'Planet'
        return 'Moon'
    }
}
