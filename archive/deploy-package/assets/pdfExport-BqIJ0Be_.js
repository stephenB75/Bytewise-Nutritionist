async function l(){const t={totalMealsLogged:156,averageDailyCalories:1850,streakRecord:21,goalCompletionRate:78,achievements:12,monthlyBreakdown:[{month:"January",calories:52e3,meals:28,goals:22},{month:"February",calories:48e3,meals:26,goals:20},{month:"March",calories:55e3,meals:30,goals:25},{month:"April",calories:51e3,meals:27,goals:23},{month:"May",calories:56e3,meals:31,goals:26},{month:"June",calories:53e3,meals:29,goals:24}]},s=`
<!DOCTYPE html>
<html>
<head>
    <title>ByteWise - 6 Month Progress Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #a8dadc; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #a8dadc; margin-bottom: 10px; }
        .subtitle { color: #666; font-size: 14px; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
        .stat-card { text-align: center; padding: 20px; background: #f8fffe; border-radius: 8px; border: 1px solid #e0e7e7; }
        .stat-value { font-size: 32px; font-weight: bold; color: #a8dadc; margin-bottom: 5px; }
        .stat-label { font-size: 14px; color: #666; }
        .monthly-chart { margin: 30px 0; }
        .month-row { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; }
        .month-name { font-weight: bold; width: 100px; }
        .month-bar { height: 20px; background: linear-gradient(90deg, #a8dadc, #fef7cd); border-radius: 10px; margin: 0 10px; }
        .month-value { font-size: 12px; color: #666; min-width: 80px; text-align: right; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">
            <div style="font-size: 28px; font-weight: bold; color: #a8dadc;">bytewise</div>
            <div style="font-size: 14px; color: #666; margin-left: 2.2ch;">Nutritionist</div>
        </div>
        <div class="subtitle">6-Month Progress Report • Generated ${new Date().toLocaleDateString()}</div>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">${t.totalMealsLogged}</div>
            <div class="stat-label">Total Meals Logged</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${t.averageDailyCalories}</div>
            <div class="stat-label">Avg Daily Calories</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${t.streakRecord}</div>
            <div class="stat-label">Best Streak (days)</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${t.goalCompletionRate}%</div>
            <div class="stat-label">Goal Completion</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${t.achievements}</div>
            <div class="stat-label">Achievements Earned</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${Math.round(t.monthlyBreakdown.reduce((e,o)=>e+o.calories,0)/1e3)}k</div>
            <div class="stat-label">Total Calories Tracked</div>
        </div>
    </div>

    <div class="monthly-chart">
        <h3>Monthly Breakdown</h3>
        ${t.monthlyBreakdown.map(e=>`
            <div class="month-row">
                <div class="month-name">${e.month}</div>
                <div class="month-bar" style="width: ${e.calories/6e4*200}px;"></div>
                <div class="month-value">${e.calories.toLocaleString()} cal • ${e.meals} meals • ${e.goals} goals</div>
            </div>
        `).join("")}
    </div>

    <div class="footer">
        <p><strong>ByteWise Nutritionist</strong> • Your Personal Nutrition Companion</p>
        <p>Keep up the great work on your nutrition journey!</p>
    </div>
</body>
</html>`;try{const e=new Blob([s],{type:"text/html"}),o=URL.createObjectURL(e),a=document.createElement("a");return a.href=o,a.download=`bytewise-progress-report-${new Date().toISOString().split("T")[0]}.html`,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(o),console.log("✅ PDF report generated and downloaded successfully"),!0}catch(e){return console.error("❌ Failed to generate PDF report:",e),!1}}export{l as generateProgressReportPDF};
