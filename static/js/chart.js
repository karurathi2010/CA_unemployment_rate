document.addEventListener('DOMContentLoaded', function() {
    // Variables that hold the interactive charts
    let industryLineChart;
    let employmentUnemploymentChart;
    let barChart;

    // Variable that hold the non-interactive chart
    let unemploymentRateLineChart;

    // Function to fetch data and update the line chart based on the selected industry title
    function fetchIndustryLineChart(selectedIndustry) {
        // Fetch the industry data from the specified endpoint
        d3.json('/industry_data').then(function(response) {
            // Filter data to include only the records for the selected industry
            const filteredData = response.filter(row => row['Industry Title'] === selectedIndustry);

            // Create an object to hold employment by year
            const employmentData = {};
            filteredData.forEach(function(row) {
                const currentYear = row['Year'];
                const currentEmployment = row['Industry Current Employment'];
                employmentData[currentYear] = currentEmployment;
            });

            // Get the years and employment values, and sort them by year
            const years = Object.keys(employmentData).sort((a, b) => a - b);
            const employments = years.map(year => employmentData[year]);

            // Calculate the employment growth rates
            const employmentGrowthRates = [];
            for (let i = 1; i < years.length; i++) {
                const growthRate = ((employments[i] - employments[i - 1]) / employments[i - 1]) * 100;
                employmentGrowthRates.push(growthRate);
            }

            // Adjust years and growth rates for plotting
            const plotYears = years.slice(1); // Skip the first year for growth rate calculation

            // If the line chart already exists, update its data
            if (industryLineChart) {
                industryLineChart.data.labels = plotYears;
                industryLineChart.data.datasets[0].data = employmentGrowthRates;
                industryLineChart.update();
            } else {
                // Otherwise, create a new line chart
                const linectx = document.getElementById('industry-line-chart').getContext('2d');

                // Set the canvas size for the chart
                linectx.canvas.width = 1810;
                linectx.canvas.height = 350;

                // Create the line chart using Chart.js
                industryLineChart = new Chart(linectx, {
                    type: 'line',
                    data: {
                        labels: plotYears,
                        datasets: [{
                            label: selectedIndustry,
                            data: employmentGrowthRates,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            fill: false
                        }]
                    },
                    options: {
                        responsive: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Employment Growth Rate for each Industry in California',
                                font: {
                                    size: 18
                                },
                                color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Year',
                                    color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                                },
                                ticks: {
                                    color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Employment Growth Rate (%)',
                                    color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                                },
                                ticks: {
                                    color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                                }
                            }
                        }
                    }
                });
            }
        }).catch(function(error) {
            // Log any error that occurs
            console.error("Error fetching data:", error);
        });
    }

    // Add event listener for the industry dropdown menu
    const industrySelect = document.getElementById('industry-select');
    industrySelect.addEventListener('change', function() {
        const selectedIndustry = industrySelect.value;
        fetchIndustryLineChart(selectedIndustry);
    });

    // Initialize the chart with the first industry in the dropdown
    if (industrySelect.options.length > 0) {
        industrySelect.selectedIndex = 0;
        fetchIndustryLineChart(industrySelect.value);
    }

    // Function to fetch and create the employment vs. unemployment chart
    function fetchAndCreateEmploymentUnemploymentChart(startDate, endDate) {
        // Fetch the industry data from the specified endpoint
        d3.json('/industry_data').then(function(response) {
            const monthlyData = {};

            response.forEach(function(row) {
                const yearMonth = `${row['Year']}-${row['Month']}`;
                const employment = row['Regional Employment'];
                const unemploymentRate = row['Regional Unemployment Rate'];

                if (!monthlyData[yearMonth]) {
                    monthlyData[yearMonth] = { employment: 0, unemploymentRate: 0, count: 0 };
                }
                monthlyData[yearMonth].employment = employment;
                monthlyData[yearMonth].unemploymentRate += unemploymentRate;
                monthlyData[yearMonth].count += 1;
            });

            const months = Object.keys(monthlyData).sort((a, b) => new Date(a) - new Date(b));

            // Filter data based on the selected date range
            const filteredMonths = months.filter(month => {
                const date = new Date(month + '-01');
                return (!startDate || date >= new Date(startDate)) && (!endDate || date <= new Date(endDate));
            });

            const employmentData = filteredMonths.map(month => monthlyData[month].employment);
            const avgUnemploymentRates = filteredMonths.map(month => monthlyData[month].unemploymentRate / monthlyData[month].count);

            // Update the chart data
            employmentUnemploymentChart.data.labels = filteredMonths;
            employmentUnemploymentChart.data.datasets[0].data = employmentData;
            employmentUnemploymentChart.data.datasets[1].data = avgUnemploymentRates;
            employmentUnemploymentChart.update();
        }).catch(function(error) {
            console.error("Error fetching data:", error);
        });
    }

    document.getElementById('update-chart').addEventListener('click', function() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        fetchAndCreateEmploymentUnemploymentChart(startDate, endDate);
    });

    // Create the empty employmentUnemploymentChart
    const ctxEmploymentUnemployment = document.getElementById('employment-unemployment-chart').getContext('2d');
    ctxEmploymentUnemployment.canvas.width = 1820;
    ctxEmploymentUnemployment.canvas.height = 400;

    employmentUnemploymentChart = new Chart(ctxEmploymentUnemployment, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Regional Employment',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Unemployment Rate',
                    data: [],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 1,
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: false,
            plugins: {
                filler: {
                    propagate: false,
                },
                title: {
                    display: true,
                    text: 'Employment vs. Unemployment Rate in California Over the Years',
                    font: {
                        size: 18
                    },
                    color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                }
            },
            pointBackgroundColor: '#fff',
            radius: 5,
            interaction: {
                intersect: false,
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Month',
                        color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                    },
                    ticks: {
                        color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Employment',
                        color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                    },
                    ticks: {
                        color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Unemployment Rate (%)',
                        color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                    },
                    ticks: {
                        color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });

    // Function to fetch data and update the bar chart based on the selected area
    function fetchDataAndUpdateBarChart(selectedArea) {
        // Fetch the county data from the specified endpoint
        d3.json(`/county_data?area=${selectedArea}`).then(function(response) {
            // Sort data by year and month
            const sortedData = response.sort((a, b) => new Date(`${a.Year}-${a.Month}-01`) - new Date(`${b.Year}-${b.Month}-01`));

            // Extract months and years
            const monthsAndYears = sortedData.map(row => `${row.Month} ${row.Year}`);
            const unemploymentRates = sortedData.map(row => row['Regional Unemployment Rate']);

            // Update the chart data
            barChart.data.labels = monthsAndYears;
            barChart.data.datasets[0].data = unemploymentRates;
            barChart.data.datasets[0].label = `Unemployment Rate in ${selectedArea}, CA`;
            barChart.data.datasets[0].backgroundColor = 'rgba(255, 0, 0, 0.2)';
            barChart.data.datasets[0].borderColor = 'rgba(255, 0, 0, 1)';
            barChart.options.plugins.title.text = `Unemployment Rate in ${selectedArea}, CA`;
            barChart.update();
        }).catch(function(error) {
            console.error("Error fetching data:", error);
        });
    }

    // Function to fetch and populate the area dropdown
    function fetchAndPopulateDropdowns() {
        d3.json('/dropdown_data').then(function(response) {
            const areaSelect = document.getElementById('area-select');

            response.areas.forEach(function(area) {
                const option = document.createElement('option');
                option.value = area;
                option.text = area;
                areaSelect.appendChild(option);
            });
        }).catch(function(error) {
            console.error("Error fetching dropdown data:", error);
        });
    }

    // Add event listener for the area dropdown menu
    const areaSelect = document.getElementById('area-select');
    areaSelect.addEventListener('change', function() {
        const selectedArea = areaSelect.value;
        if (selectedArea) {
            fetchDataAndUpdateBarChart(selectedArea);
        }
    });

    // Initial chart load for the new bar chart with empty data
    fetchAndPopulateDropdowns();

    // Create the empty bar chart
    const ctx = document.getElementById('new-bar-chart').getContext('2d');
    ctx.canvas.width = 1810;
    ctx.canvas.height = 420;

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: '',
                data: [],
                backgroundColor: 'rgba(255, 0, 0, 0.2)', 
                borderColor: 'rgba(255, 0, 0, 1)', 
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Unemployment Rate in each County in California',
                    font: {
                        size: 18
                    },
                    color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Month and Year',
                        color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                    },
                    ticks: {
                        color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Unemployment Rate (%)',
                        color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                    },
                    ticks: {
                        color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                    }
                }
            }
        }
    });

    // Function to fetch the unemployment rate line plot
    function fetchUnemploymentRateLinePlot() {
        console.log("Fetching data for second line plot");

        // Fetch data from the specified endpoint
        fetch('./industry_data')
            .then(response => response.json())
            .then(function(response) {
                // Extract 'Year' and 'Regional_Unemployment_Rate' from the response
                const xYear = response.map(row => row['Year']);
                const yRate = response.map(row => row['Regional Unemployment Rate']);

                // Group yRate values by xYear values and calculate the average
                const groupedData = {};
                xYear.forEach((value, index) => {
                    if (!groupedData[value]) {
                        groupedData[value] = [];
                    }
                    groupedData[value].push(yRate[index]);
                });

                // Extract grouped years and their corresponding unemployment rates
                const groupedX = Object.keys(groupedData);
                const groupedY = groupedX.map(key => groupedData[key].reduce((a, b) => a + b, 0) / groupedData[key].length);

                // Create dataset object for the chart
                const data = {
                    labels: groupedX,
                    datasets: [{
                        label: 'Average Unemployment Rate',
                        data: groupedY,
                        borderColor: 'rgba(255, 0, 0, 1)', 
                        borderWidth: 1,
                        fill: false
                    }]
                };

                // Create options object for the chart
                const options = {
                    responsive: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'California Unemployment Rate Timeline',
                            font: {
                                size: 18
                            },
                            color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Year',
                                color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                            },
                            ticks: {
                                color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Average Unemployment Rate',
                                color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                            },
                            ticks: {
                                color: document.getElementById('darkModeToggle').checked ? '#ffffff' : '#000000'
                            }
                        }
                    }
                };

                // Get the canvas context
                const ctx = document.getElementById('unemploymentrate-line-chart').getContext('2d');
                ctx.canvas.width = 1795;
                ctx.canvas.height = 360;

                // Create the line chart
                unemploymentRateLineChart = new Chart(ctx, {
                    type: 'line',
                    data: data,
                    options: options
                });
            }).catch(function(error) {
                // Log any errors
                console.error("Error fetching data:", error);
            });
    }

    // Call the function to fetch the unemployment rate line plot data
    fetchUnemploymentRateLinePlot();

    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('change', function() {
        document.body.classList.toggle('dark-mode');
        updateChartColors();
    });

    function updateChartColors() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const color = isDarkMode ? '#ffffff' : '#000000';

        // Update the colors for all charts
        [industryLineChart, employmentUnemploymentChart, barChart, unemploymentRateLineChart].forEach(chart => {
            if (chart) {
                chart.options.plugins.title.color = color;
                chart.options.scales.x.title.color = color;
                chart.options.scales.x.ticks.color = color;
                chart.options.scales.y.title.color = color;
                chart.options.scales.y.ticks.color = color;
                if (chart.options.scales.y1) {
                    chart.options.scales.y1.title.color = color;
                    chart.options.scales.y1.ticks.color = color;
                }
                chart.update();
            }
        });
    }
});
