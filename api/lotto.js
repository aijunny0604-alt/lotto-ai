// Vercel Serverless Function - 동행복권 API 프록시
export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { from } = req.query;
  
  try {
    // 최신 회차 계산
    const startDate = new Date('2002-12-07');
    const today = new Date();
    const weeks = Math.floor((today - startDate) / (7 * 24 * 60 * 60 * 1000));
    const estimatedLatest = weeks + 1;
    
    const fromRound = parseInt(from) || estimatedLatest;
    const results = [];
    
    // 최대 10개 회차 가져오기
    for (let i = 0; i < 10; i++) {
      const round = fromRound + i;
      if (round > estimatedLatest + 1) break;
      
      try {
        const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://www.dhlottery.co.kr/'
          }
        });
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        if (data.returnValue === 'success') {
          results.push({
            round: data.drwNo,
            numbers: [
              data.drwtNo1, data.drwtNo2, data.drwtNo3,
              data.drwtNo4, data.drwtNo5, data.drwtNo6
            ].sort((a, b) => a - b),
            bonus: data.bnusNo,
            date: data.drwNoDate
          });
        }
      } catch (e) {
        // 개별 회차 실패는 무시
        continue;
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      data: results,
      estimated: estimatedLatest
    });
    
  } catch (error) {
    return res.status(200).json({ 
      success: false, 
      error: error.message,
      data: []
    });
  }
}
