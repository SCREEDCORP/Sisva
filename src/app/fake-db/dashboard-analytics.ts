export class AnalyticsDashboardDb
{
    public static widgets = {
        widget1: {
            chartType: 'line',
            datasets : {
                '2016': [
                    {
                        label: 'Estatura',
                        data : [0.90, 0.98, 1.00, 1.10, 1.20, 1.21],
                        fill : 'start'

                    }
                ]
            },
            labels   : ['Nov 2018', 'Dic 2018', 'Ene 2019', 'Feb 2019', 'Mar 2019', 'Abr 2019'],
            colors   : [
                {
                    borderColor              : '#42a5f5',
                    backgroundColor          : '#42a5f5',
                    pointBackgroundColor     : '#1e88e5',
                    pointHoverBackgroundColor: '#1e88e5',
                    pointBorderColor         : '#ffffff',
                    pointHoverBorderColor    : '#ffffff'
                }
            ],
            options  : {
                spanGaps           : false,
                legend             : {
                    display: false
                },
                maintainAspectRatio: false,
                layout             : {
                    padding: {
                        top  : 32,
                        left : 32,
                        right: 32
                    }
                },
                elements           : {
                    point: {
                        radius          : 4,
                        borderWidth     : 2,
                        hoverRadius     : 4,
                        hoverBorderWidth: 2
                    },
                    line : {
                        tension: 0
                    }
                },
                scales             : {
                    xAxes: [
                        {
                            gridLines: {
                                display       : false,
                                drawBorder    : false,
                                tickMarkLength: 18
                            },
                            ticks    : {
                                fontColor: '#ffffff'
                            }
                        }
                    ],
                    yAxes: [
                        {
                            display: false,
                            ticks  : {
                                min     : 0,
                                max     : 2,
                                stepSize: 2
                            }
                        }
                    ]
                },
                plugins            : {
                    filler      : {
                        propagate: false
                    },
                    xLabelsOnTop: {
                        active: true
                    }
                }
            }
        }
    };
}
