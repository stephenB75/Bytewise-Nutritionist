const systemDate = new Date();
console.log('System Date:', systemDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
console.log('System Date ISO:', systemDate.toISOString());
console.log('System Date getDate():', systemDate.getDate());
console.log('System Date getMonth():', systemDate.getMonth()); // 0-indexed
console.log('System Date getFullYear():', systemDate.getFullYear());
