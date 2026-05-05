window.LucideIcon = ({ name, size = 16, className = '' }) => {
    const pascal = name
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');

    const iconData = window.lucide && window.lucide[pascal];

    if (!iconData) {
        return React.createElement('span', {
            style: { display: 'inline-block', width: size, height: size }
        });
    }

    // Lucide puede exponer la función createIcons o datos crudos
    // Intentamos llamarlo como función primero
    if (typeof iconData === 'function') {
        try {
            const result = iconData();
            if (result && result.innerHTML) {
                return React.createElement('span', {
                    dangerouslySetInnerHTML: { __html: result.innerHTML },
                    style: { display: 'inline-flex', width: size, height: size }
                });
            }
        } catch(e) {}
    }

    // Formato array: [tag, attrs, children]
    if (Array.isArray(iconData)) {
        const children = iconData[2] || [];
        const svgChildren = children
            .filter(c => Array.isArray(c))
            .map(([tag, childAttrs], i) =>
                React.createElement(tag, { key: i, ...childAttrs })
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
        }, ...svgChildren);
    }

    // Formato objeto con toSvg
    if (iconData.toSvg) {
        return React.createElement('span', {
            dangerouslySetInnerHTML: { __html: iconData.toSvg({ width: size, height: size, class: className }) },
            style: { display: 'inline-flex', alignItems: 'center' }
        });
    }

    return React.createElement('span', {
        style: { display: 'inline-block', width: size, height: size }
    });
};
