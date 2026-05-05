window.LucideIcon = ({ name, size = 16, className = '' }) => {
        const icons = {
        'chevron-left':    [['path', {d:'M15 18l-6-6 6-6'}]],
        'chevron-right':   [['path', {d:'M9 18l6-6-6-6'}]],
        'chevron-down':    [['path', {d:'M6 9l6 6 6-6'}]],
        'trending-up':     [['polyline',{points:'22 7 13.5 15.5 8.5 10.5 2 17'}],['polyline',{points:'16 7 22 7 22 13'}]],
        'trending-down':   [['polyline',{points:'22 17 13.5 8.5 8.5 13.5 2 7'}],['polyline',{points:'16 17 22 17 22 11'}]],
        'bar-chart-3':     [['path',{d:'M3 3v18h18'}],['path',{d:'M18 17V9'}],['path',{d:'M13 17V5'}],['path',{d:'M8 17v-3'}]],
        'bar-chart-2':     [['path',{d:'M18 20V10'}],['path',{d:'M12 20V4'}],['path',{d:'M6 20v-6'}]],
        'arrow-up-right':  [['path',{d:'M7 17L17 7'}],['path',{d:'M7 7h10v10'}]],
        'arrow-down-left': [['path',{d:'M17 7L7 17'}],['path',{d:'M17 17H7V7'}]],
        'scissors':        [['circle',{cx:'6',cy:'6',r:'3'}],['circle',{cx:'6',cy:'18',r:'3'}],['line',{x1:'20',y1:'4',x2:'8.12',y2:'15.88'}],['line',{x1:'14.47',y1:'14.48',x2:'20',y2:'20'}],['line',{x1:'8.12',y1:'8.12',x2:'12',y2:'12'}]],
        'receipt':         [['path',{d:'M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z'}],['line',{x1:'8',y1:'8',x2:'16',y2:'8'}],['line',{x1:'8',y1:'12',x2:'16',y2:'12'}],['line',{x1:'8',y1:'16',x2:'12',y2:'16'}]],
        'shopping-bag':    [['path',{d:'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z'}],['line',{x1:'3',y1:'6',x2:'21',y2:'6'}],['path',{d:'M16 10a4 4 0 0 1-8 0'}]],
        'wallet':          [['path',{d:'M21 12V7H5a2 2 0 0 1 0-4h14v4'}],['path',{d:'M3 5v14a2 2 0 0 0 2 2h16v-5'}],['path',{d:'M18 12h.01'}]],
        'trash-2':         [['path',{d:'M3 6h18'}],['path',{d:'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'}],['path',{d:'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'}],['line',{x1:'10',y1:'11',x2:'10',y2:'17'}],['line',{x1:'14',y1:'11',x2:'14',y2:'17'}]],
        'loader-2':        [['path',{d:'M21 12a9 9 0 1 1-6.219-8.56'}]],
        'user-plus':       [['path',{d:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'}],['circle',{cx:'9',cy:'7',r:'4'}],['line',{x1:'19',y1:'8',x2:'19',y2:'14'}],['line',{x1:'22',y1:'11',x2:'16',y2:'11'}]],
        'user-minus':      [['path',{d:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'}],['circle',{cx:'9',cy:'7',r:'4'}],['line',{x1:'22',y1:'11',x2:'16',y2:'11'}]],
        'phone':           [['path',{d:'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'}]],
        'users':           [['path',{d:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'}],['circle',{cx:'9',cy:'7',r:'4'}],['path',{d:'M23 21v-2a4 4 0 0 0-3-3.87'}],['path',{d:'M16 3.13a4 4 0 0 1 0 7.75'}]],
        'search':          [['circle',{cx:'11',cy:'11',r:'8'}],['line',{x1:'21',y1:'21',x2:'16.65',y2:'16.65'}]],
        'award':           [['circle',{cx:'12',cy:'8',r:'7'}],['polyline',{points:'8.21 13.89 7 23 12 20 17 23 15.79 13.88'}]],
        'dollar-sign':     [['line',{x1:'12',y1:'1',x2:'12',y2:'23'}],['path',{d:'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'}]],
        'pie-chart':       [['path',{d:'M21.21 15.89A10 10 0 1 1 8 2.83'}],['path',{d:'M22 12A10 10 0 0 0 12 2v10z'}]],
        'calendar':        [['rect',{x:'3',y:'4',width:'18',height:'18',rx:'2',ry:'2'}],['line',{x1:'16',y1:'2',x2:'16',y2:'6'}],['line',{x1:'8',y1:'2',x2:'8',y2:'6'}],['line',{x1:'3',y1:'10',x2:'21',y2:'10'}]],
        'clock':           [['circle',{cx:'12',cy:'12',r:'10'}],['polyline',{points:'12 6 12 12 16 14'}]],
        'plus':            [['line',{x1:'12',y1:'5',x2:'12',y2:'19'}],['line',{x1:'5',y1:'12',x2:'19',y2:'12'}]],
        'x':               [['line',{x1:'18',y1:'6',x2:'6',y2:'18'}],['line',{x1:'6',y1:'6',x2:'18',y2:'18'}]],
        'check':           [['polyline',{points:'20 6 9 17 4 12'}]],
        'edit':            [['path',{d:'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'}],['path',{d:'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'}]],
        'save':            [['path',{d:'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z'}],['polyline',{points:'17 21 17 13 7 13 7 21'}],['polyline',{points:'7 3 7 8 15 8'}]],
        'log-out':         [['path',{d:'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'}],['polyline',{points:'16 17 21 12 16 7'}],['line',{x1:'21',y1:'12',x2:'9',y2:'12'}]],
        'menu':            [['line',{x1:'3',y1:'12',x2:'21',y2:'12'}],['line',{x1:'3',y1:'6',x2:'21',y2:'6'}],['line',{x1:'3',y1:'18',x2:'21',y2:'18'}]],
        'bell':            [['path',{d:'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'}],['path',{d:'M13.73 21a2 2 0 0 1-3.46 0'}]],
        'settings':        [['circle',{cx:'12',cy:'12',r:'3'}],['path',{d:'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'}]],
        'home':            [['path',{d:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'}],['polyline',{points:'9 22 9 12 15 12 15 22'}]],
        'git-branch':      [['line',{x1:'6',y1:'3',x2:'6',y2:'15'}],['circle',{cx:'18',cy:'6',r:'3'}],['circle',{cx:'6',cy:'18',r:'3'}],['path',{d:'M18 9a9 9 0 0 1-9 9'}]],
    };
}


    const shapes = icons[name];

    if (!shapes) {
        return React.createElement('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        className: className,
        style: { display: 'inline-block', verticalAlign: 'middle', color: 'inherit' }
    }, ...children);

    const children = shapes.map(([tag, attrs], i) =>
        React.createElement(tag, { key: i, ...attrs })
    );

    return React.createElement('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        className: className
    }, ...children); 
    }
