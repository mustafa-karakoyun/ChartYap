import type { TopLevelSpec } from 'vega-lite';

export interface ColumnAnalysis {
    name: string;
    type: 'numeric' | 'categorical' | 'datetime' | 'boolean';
    uniqueCount: number;
}

export interface ChartSuggestion {
    id: string;
    title: string;
    best_chart_type: string;
    why: string;
    columns_used: string[];
    alternative_chart_types: string[];
    vega_lite_code: TopLevelSpec;
    sound_cue?: string;
    caveats?: string;
}

const isNumeric = (val: any) => !isNaN(parseFloat(val)) && isFinite(val);
const isDate = (val: any) => !isNaN(Date.parse(val));

export function analyzeColumns(data: any[]): Record<string, ColumnAnalysis> {
    if (!data || data.length === 0) return {};
    const columns = Object.keys(data[0]);
    const analysis: Record<string, ColumnAnalysis> = {};

    columns.forEach(col => {
        const values = data.map(d => d[col]);
        const definedValues = values.filter(v => v !== null && v !== undefined && v !== '');
        const unique = new Set(definedValues).size;

        let type: 'numeric' | 'categorical' | 'datetime' | 'boolean' = 'categorical';

        const numericCount = definedValues.filter(isNumeric).length;
        const dateCount = definedValues.filter(isDate).length;
        const total = definedValues.length;

        if (total > 0) {
            if (numericCount / total > 0.8) type = 'numeric';
            else if (dateCount / total > 0.8 && dateCount > numericCount) type = 'datetime';
        }

        analysis[col] = { name: col, type, uniqueCount: unique };
    });

    return analysis;
}

export function generateSuggestions(data: any[], preferredType?: string): ChartSuggestion[] {
    const colAnalysis = analyzeColumns(data);
    const cols = Object.values(colAnalysis);
    const numericCols = cols.filter(c => c.type === 'numeric');
    const categoricalCols = cols.filter(c => c.type === 'categorical');
    const dateCols = cols.filter(c => c.type === 'datetime');

    let suggestions: ChartSuggestion[] = [];
    let count = 0;

    // Track used types to ensure diversity
    const usedTypes = new Set<string>();
    const add = (s: Omit<ChartSuggestion, 'id'>) => {
        if (usedTypes.has(s.best_chart_type) && suggestions.length > 5) {
            return;
        }

        count++;
        suggestions.push({ id: `chart-${count}`, ...s });
        usedTypes.add(s.best_chart_type);
    };

    // 1. Bubble Chart (3+ vars: 2 num, 1 cat/num size)
    if (numericCols.length >= 2 && categoricalCols.length > 0) {
        add({
            title: `Multivariate Analysis: ${numericCols[0].name} vs ${numericCols[1].name}`,
            best_chart_type: 'Bubble Chart',
            why: `high-dimensional view relating ${numericCols[0].name}, ${numericCols[1].name}, and ${categoricalCols[0].name}.`,
            columns_used: [numericCols[0].name, numericCols[1].name, numericCols[2]?.name || numericCols[0].name, categoricalCols[0].name],
            alternative_chart_types: ['Scatter Plot'],
            vega_lite_code: {
                $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                data: { values: data },
                mark: 'circle',
                encoding: {
                    x: { field: numericCols[0].name, type: 'quantitative' },
                    y: { field: numericCols[1].name, type: 'quantitative' },
                    size: { field: numericCols[2]?.name || numericCols[0].name, type: 'quantitative' },
                    color: { field: categoricalCols[0].name, type: 'nominal' }
                }
            }
        });
    }

    // 2. Heatmap (3 vars: 2 cat, 1 num)
    if (categoricalCols.length >= 2 && numericCols.length > 0) {
        add({
            title: `Heatmap Distribution`,
            best_chart_type: 'Heatmap',
            why: `Intensity of ${numericCols[0].name} across ${categoricalCols[0].name} and ${categoricalCols[1].name}.`,
            columns_used: [categoricalCols[0].name, categoricalCols[1].name, numericCols[0].name],
            alternative_chart_types: ['Grouped Bar Chart'],
            vega_lite_code: {
                $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                data: { values: data },
                mark: 'rect',
                encoding: {
                    x: { field: categoricalCols[0].name, type: 'nominal' },
                    y: { field: categoricalCols[1].name, type: 'nominal' },
                    color: { field: numericCols[0].name, aggregate: 'mean', type: 'quantitative' }
                }
            }
        });
    }

    // 3. Stacked Bar (Composition)
    if (categoricalCols.length >= 2 && numericCols.length > 0) {
        add({
            title: `Composition by ${categoricalCols[0].name}`,
            best_chart_type: 'Stacked Bar Chart',
            why: `Breakdown of ${numericCols[0].name} by ${categoricalCols[0].name} subdivisions.`,
            columns_used: [categoricalCols[0].name, categoricalCols[1].name, numericCols[0].name],
            alternative_chart_types: ['Grouped Bar Chart'],
            vega_lite_code: {
                $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                data: { values: data },
                mark: { type: 'bar', tooltip: true },
                encoding: {
                    x: { field: categoricalCols[0].name, type: 'nominal' },
                    y: { field: numericCols[0].name, type: 'quantitative', aggregate: 'sum' },
                    color: { field: categoricalCols[1].name, type: 'nominal' }
                }
            }
        });
    }

    // 4. Line Chart (Time Series)
    if (dateCols.length > 0 && numericCols.length > 0) {
        const cat = categoricalCols[0];
        add({
            title: `Trend over Time`,
            best_chart_type: 'Line Chart',
            why: `Temporal evolution of ${numericCols[0].name}.`,
            columns_used: [dateCols[0].name, numericCols[0].name, ...(cat ? [cat.name] : [])],
            alternative_chart_types: ['Area Chart'],
            vega_lite_code: {
                $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                data: { values: data },
                mark: { type: 'line', point: true },
                encoding: {
                    x: { field: dateCols[0].name, type: 'temporal' },
                    y: { field: numericCols[0].name, type: 'quantitative' },
                    color: cat ? { field: cat.name, type: 'nominal' } : undefined
                }
            }
        });
    }

    // 5. Grouped Bar (Comparison)
    if (categoricalCols.length >= 2 && numericCols.length > 0) {
        add({
            title: `Side-by-Side Comparison`,
            best_chart_type: 'Grouped Bar Chart',
            why: `Direct comparison of ${numericCols[0].name} across groups.`,
            columns_used: [categoricalCols[0].name, categoricalCols[1].name, numericCols[0].name],
            alternative_chart_types: ['Stacked Bar Chart'],
            vega_lite_code: {
                $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                data: { values: data },
                mark: { type: 'bar', tooltip: true },
                encoding: {
                    x: { field: categoricalCols[0].name, type: 'nominal' },
                    y: { field: numericCols[0].name, type: 'quantitative', aggregate: 'sum' },
                    xOffset: { field: categoricalCols[1].name },
                    color: { field: categoricalCols[1].name }
                }
            }
        });
    }

    // 6. Scatter Plot (2 vars)
    if (numericCols.length >= 2) {
        const n1 = numericCols[0];
        const n2 = numericCols[1];
        add({
            title: `${n1.name} vs ${n2.name}`,
            best_chart_type: 'Scatter Plot',
            why: `Correlation between ${n1.name} and ${n2.name}.`,
            columns_used: [n1.name, n2.name],
            alternative_chart_types: ['Bubble Chart'],
            vega_lite_code: {
                $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                data: { values: data },
                mark: 'circle',
                encoding: {
                    x: { field: n1.name, type: 'quantitative', scale: { zero: false } },
                    y: { field: n2.name, type: 'quantitative', scale: { zero: false } },
                    color: categoricalCols.length > 0 ? { field: categoricalCols[0].name } : undefined
                }
            }
        });
    }

    // 7. Boxplot
    if (numericCols.length > 0) {
        add({
            title: `Statistical Distribution of ${numericCols[0].name}`,
            best_chart_type: 'Boxplot',
            why: `Quartiles and median of ${numericCols[0].name}.`,
            columns_used: [numericCols[0].name, ...(categoricalCols.length > 0 ? [categoricalCols[0].name] : [])],
            alternative_chart_types: ['Violin Plot'],
            vega_lite_code: {
                $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                data: { values: data },
                mark: { type: 'boxplot', extent: 'min-max' },
                encoding: {
                    x: categoricalCols.length > 0 ? { field: categoricalCols[0].name, type: 'nominal' } : undefined,
                    y: { field: numericCols[0].name, type: 'quantitative' },
                    color: categoricalCols.length > 0 ? { field: categoricalCols[0].name } : { value: '#10b981' }
                }
            }
        });
    }

    // 8. Donut Chart
    if (categoricalCols.length > 0 && numericCols.length > 0) {
        const bestCat = categoricalCols.find(c => c.uniqueCount < 8) || categoricalCols[0];
        if (bestCat) {
            add({
                title: `${bestCat.name} Share`,
                best_chart_type: 'Donut Chart',
                why: `Market share/proportion of ${bestCat.name}.`,
                columns_used: [bestCat.name, numericCols[0].name],
                alternative_chart_types: ['Bar Chart'],
                vega_lite_code: {
                    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                    data: { values: data },
                    mark: { type: 'arc', innerRadius: 50 },
                    encoding: {
                        theta: { field: numericCols[0].name, aggregate: 'sum' },
                        color: { field: bestCat.name, type: 'nominal' }
                    }
                }
            });
        }
    }

    // 9. Histogram
    if (numericCols.length > 0) {
        const targetNum = numericCols[1] || numericCols[0];
        add({
            title: `Frequency of ${targetNum.name}`,
            best_chart_type: 'Histogram',
            why: `Distribution spread of ${targetNum.name}.`,
            columns_used: [targetNum.name],
            alternative_chart_types: ['Density Plot'],
            vega_lite_code: {
                $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                data: { values: data },
                mark: 'bar',
                encoding: {
                    x: { field: targetNum.name, bin: true },
                    y: { aggregate: 'count' },
                    color: { value: '#8b5cf6' }
                }
            }
        });
    }

    // 10. Stacked Area
    if (dateCols.length > 0 && numericCols.length > 0 && categoricalCols.length > 0) {
        add({
            title: `Volume Trends by Category`,
            best_chart_type: 'Stacked Area Chart',
            why: `Evolution of ${numericCols[0].name} breakdown over time.`,
            columns_used: [dateCols[0].name, numericCols[0].name, categoricalCols[0].name],
            alternative_chart_types: ['Streamgraph'],
            vega_lite_code: {
                $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                data: { values: data },
                mark: 'area',
                encoding: {
                    x: { field: dateCols[0].name, type: 'temporal' },
                    y: { field: numericCols[0].name, type: 'quantitative', stack: 'normalize' },
                    color: { field: categoricalCols[0].name }
                }
            }
        });
    }

    // 11. Bar Chart
    if (categoricalCols.length > 0 && numericCols.length > 0) {
        add({
            title: `${numericCols[0].name} by ${categoricalCols[0].name}`,
            best_chart_type: 'Bar Chart',
            why: `Simple comparison of ${numericCols[0].name}.`,
            columns_used: [categoricalCols[0].name, numericCols[0].name],
            alternative_chart_types: ['Lollipop Chart'],
            vega_lite_code: {
                $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                data: { values: data },
                mark: { type: 'bar', cornerRadiusEnd: 4 },
                encoding: {
                    x: { field: categoricalCols[0].name, type: 'nominal', sort: '-y' },
                    y: { field: numericCols[0].name, type: 'quantitative' },
                    color: { field: categoricalCols[0].name, legend: null }
                }
            }
        });
    }

    // 12. Density Plot
    if (numericCols.length > 0) {
        add({
            title: `${numericCols[0].name} Density Curve`,
            best_chart_type: 'Density Plot',
            why: `Smoothed probability distribution.`,
            columns_used: [numericCols[0].name],
            alternative_chart_types: ['Histogram'],
            vega_lite_code: {
                $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                data: { values: data },
                transform: [{ density: numericCols[0].name }],
                mark: 'area',
                encoding: {
                    x: { field: 'value', type: 'quantitative' },
                    y: { field: 'density', type: 'quantitative' },
                    color: { value: '#ec4899' }
                }
            }
        });
    }

    // 13. Pie Chart (Alternative to Donut)
    if (categoricalCols.length > 0 && numericCols.length > 0) {
        const bestCat = categoricalCols.find(c => c.uniqueCount < 6) || categoricalCols[0];
        if (bestCat) {
            add({
                title: `${bestCat.name} Distribution`,
                best_chart_type: 'Pie Chart',
                why: `Classic part-to-whole comparison for ${bestCat.name}.`,
                columns_used: [bestCat.name, numericCols[0].name],
                alternative_chart_types: ['Donut Chart', 'Bar Chart'],
                caveats: "Hard to compare slice sizes accurately.",
                vega_lite_code: {
                    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                    data: { values: data },
                    mark: { type: 'arc', outerRadius: 80 },
                    encoding: {
                        theta: { field: numericCols[0].name, aggregate: 'sum' },
                        color: { field: bestCat.name, type: 'nominal' }
                    }
                }
            });
        }
    }

    // 14. Area Chart (Simple)
    if (dateCols.length > 0 && numericCols.length > 0) {
        add({
            title: `Volume over Time`,
            best_chart_type: 'Area Chart',
            why: `Emphasizes the magnitude of change in ${numericCols[0].name} over time.`,
            columns_used: [dateCols[0].name, numericCols[0].name],
            alternative_chart_types: ['Line Chart'],
            vega_lite_code: {
                $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                data: { values: data },
                mark: 'area',
                encoding: {
                    x: { field: dateCols[0].name, type: 'temporal' },
                    y: { field: numericCols[0].name, type: 'quantitative' }
                }
            }
        });
    }

    // 15. 100% Stacked Bar Chart
    if (categoricalCols.length >= 2 && numericCols.length > 0) {
        add({
            title: `Relative Proportions by ${categoricalCols[0].name}`,
            best_chart_type: '100% Stacked Bar Chart',
            why: `Compare relative percentage of ${categoricalCols[1].name} within each ${categoricalCols[0].name}.`,
            columns_used: [categoricalCols[0].name, categoricalCols[1].name, numericCols[0].name],
            alternative_chart_types: ['Stacked Bar Chart'],
            vega_lite_code: {
                $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                data: { values: data },
                mark: 'bar',
                encoding: {
                    x: { field: categoricalCols[0].name, type: 'nominal' },
                    y: { field: numericCols[0].name, type: 'quantitative', aggregate: 'sum', stack: 'normalize' },
                    color: { field: categoricalCols[1].name }
                }
            }
        });
    }

    // 16. 100% Stacked Area Chart
    if (dateCols.length > 0 && numericCols.length > 0 && categoricalCols.length > 0) {
        add({
            title: `Relative Trend Contribution`,
            best_chart_type: '100% Stacked Area Chart',
            why: `Show how the contribution of each ${categoricalCols[0].name} changes over time (normalized).`,
            columns_used: [dateCols[0].name, numericCols[0].name, categoricalCols[0].name],
            alternative_chart_types: ['Stacked Area Chart'],
            vega_lite_code: {
                $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                data: { values: data },
                mark: 'area',
                encoding: {
                    x: { field: dateCols[0].name, type: 'temporal' },
                    y: { field: numericCols[0].name, type: 'quantitative', stack: 'normalize' },
                    color: { field: categoricalCols[0].name }
                }
            }
        });
    }

    // 17. Radial Bar Chart
    if (categoricalCols.length > 0 && numericCols.length > 0) {
        add({
            title: `Radial View: ${numericCols[0].name}`,
            best_chart_type: 'Radial Bar Chart',
            why: `Aesthetic variation for comparing ${numericCols[0].name} by ${categoricalCols[0].name}.`,
            columns_used: [categoricalCols[0].name, numericCols[0].name],
            alternative_chart_types: ['Bar Chart', 'Donut Chart'],
            vega_lite_code: {
                $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                data: { values: data },
                layer: [
                    {
                        mark: { type: "arc", innerRadius: 20, stroke: "#fff" }
                    },
                    {
                        mark: { type: "text", radiusOffset: 10 },
                        encoding: {
                            text: { field: numericCols[0].name, type: "quantitative" },
                            color: { value: "black" }
                        }
                    }
                ],
                encoding: {
                    theta: { field: numericCols[0].name, type: "quantitative", stack: true },
                    radius: { field: numericCols[0].name, scale: { type: "sqrt", zero: true, rangeMin: 20 } },
                    color: { field: categoricalCols[0].name, type: "nominal", legend: null }
                }
            }
        });
    }

    // 18. Trellis Bar Chart (Faceted)
    if (categoricalCols.length >= 2 && numericCols.length > 0) {
        add({
            title: `Distribution across ${categoricalCols[1].name}`,
            best_chart_type: 'Trellis Bar Chart',
            why: `Small multiples to compare ${numericCols[0].name} by ${categoricalCols[0].name} for each ${categoricalCols[1].name}.`,
            columns_used: [categoricalCols[0].name, categoricalCols[1].name, numericCols[0].name],
            alternative_chart_types: ['Grouped Bar Chart'],
            vega_lite_code: {
                $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                data: { values: data },
                mark: 'bar',
                encoding: {
                    x: { field: categoricalCols[0].name, type: 'nominal' },
                    y: { field: numericCols[0].name, type: 'quantitative', aggregate: 'sum' },
                    color: { field: categoricalCols[0].name, legend: null },
                    row: { field: categoricalCols[1].name }
                }
            }
        });
    }

    // 19. Dual Axis Chart (Layered)
    if (dateCols.length > 0 && numericCols.length >= 2) {
        add({
            title: `Dual Metrics: ${numericCols[0].name} & ${numericCols[1].name}`,
            best_chart_type: 'Dual Axis Chart',
            why: `Compare trends of two different scales (${numericCols[0].name} and ${numericCols[1].name}) over time.`,
            columns_used: [dateCols[0].name, numericCols[0].name, numericCols[1].name],
            alternative_chart_types: ['Line Chart'],
            vega_lite_code: {
                $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                data: { values: data },
                encoding: { x: { field: dateCols[0].name, type: 'temporal' } },
                layer: [
                    {
                        mark: { type: 'line', color: '#10b981' },
                        encoding: { y: { field: numericCols[0].name, type: 'quantitative' } }
                    },
                    {
                        mark: { type: 'line', color: '#3b82f6' },
                        encoding: { y: { field: numericCols[1].name, type: 'quantitative' } }
                    }
                ],
                resolve: { scale: { y: 'independent' } }
            }
        });
    }

    // 20. Pyramid Chart
    if (categoricalCols.length > 0 && numericCols.length >= 2) {
        add({
            title: `Population Pyramid Style`,
            best_chart_type: 'Pyramid Chart',
            why: `Compare distributions of ${numericCols[0].name} and ${numericCols[1].name} side-by-side.`,
            columns_used: [categoricalCols[0].name, numericCols[0].name, numericCols[1].name],
            alternative_chart_types: ['Grouped Bar Chart'],
            vega_lite_code: {
                $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
                data: { values: data },
                spacing: 0,
                hconcat: [
                    {
                        mark: { type: 'bar', color: '#ef4444' },
                        title: numericCols[0].name,
                        encoding: {
                            y: { field: categoricalCols[0].name, axis: null },
                            x: { field: numericCols[0].name, aggregate: 'sum', sort: 'descending' }
                        }
                    },
                    {
                        width: 20,
                        view: { stroke: null },
                        mark: { type: 'text', align: 'center' },
                        encoding: {
                            y: { field: categoricalCols[0].name, type: 'nominal', axis: null },
                            text: { field: categoricalCols[0].name }
                        }
                    },
                    {
                        mark: { type: 'bar', color: '#3b82f6' },
                        title: numericCols[1].name,
                        encoding: {
                            y: { field: categoricalCols[0].name, axis: null },
                            x: { field: numericCols[1].name, aggregate: 'sum' }
                        }
                    }
                ]
            }
        });
    }

    // --- Prioritization Logic ---
    if (preferredType) {
        // Normalize preference string (e.g. "Bar Chart" -> "bar")
        const normalize = (s: string) => s.toLowerCase().replace(' chart', '').replace(' plot', '');
        const target = normalize(preferredType);

        suggestions.sort((a, b) => {
            const aMatch = normalize(a.best_chart_type) === target;
            const bMatch = normalize(b.best_chart_type) === target;
            return (aMatch === bMatch) ? 0 : aMatch ? -1 : 1;
        });

        // If the preferred type exists, mark it as "MATCHED" for UI
        if (suggestions.some(s => normalize(s.best_chart_type) === target)) {
            suggestions[0].caveats = `Matches your uploaded ${preferredType} style!`;
        }
    }

    return suggestions;
}
