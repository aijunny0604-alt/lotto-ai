export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600');
  
  const { round, from } = req.query;
  
  try {
    if (round) {
      const response = await fetch(
        `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`
      );
      const data = await response.json();
      
      if (data.returnValue === 'success') {
        return res.status(200).json({
          success: true,
          round: data.drwNo,
          numbers: [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6],
          bonus: data.bnusNo,
          date: data.drwNoDate
        });
      }
      return res.status(200).json({ success: false });
    }
    
    const startRound = parseInt(from) || 1200;
    const newData = [];
    let latestRound = startRound;
    
    for (let i = startRound + 50; i >= startRound; i--) {
      const checkRes = await fetch(
        `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${i}`
      );
      const checkData = await checkRes.json();
      if (checkData.returnValue === 'success') {
        latestRound = i;
        break;
      }
    }
    
    for (let i = startRound; i <= latestRound; i++) {
      const response = await fetch(
        `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${i}`
      );
      const data = await response.json();
      
      if (data.returnValue === 'success') {
        newData.push({
          round: data.drwNo,
          numbers: [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6],
          bonus: data.bnusNo,
          date: data.drwNoDate
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      latestRound,
      fromRound: startRound,
      count: newData.length,
      data: newData
    });
    
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
