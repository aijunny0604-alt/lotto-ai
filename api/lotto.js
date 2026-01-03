export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { from } = req.query;
  const fromRound = parseInt(from) || 1;
  
  try {
    const results = [];
    
    // 최신 회차 번호 계산
    const startDate = new Date('2002-12-07');
    const today = new Date();
    const weeks = Math.floor((today - startDate) / (7 * 24 * 60 * 60 * 1000));
    const latestRound = weeks + 1;
    
    // fromRound부터 최신까지 가져오기 (최대 20개)
    const maxFetch = Math.min(latestRound - fromRound + 1, 20);
    
    for (let i = 0; i < maxFetch; i++) {
      const round = fromRound + i;
      if (round > latestRound) break;
      
      const response = await fetch(
        `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`
      );
      const data = await response.json();
      
      if (data.returnValue === 'success') {
        results.push({
          round: data.drwNo,
          numbers: [
            data.drwtNo1, data.drwtNo2, data.drwtNo3,
            data.drwtNo4, data.drwtNo5, data.drwtNo6
          ].sort((a, b) => a - b),
          bonus: data.bnusNo
        });
      }
    }
    
    res.status(200).json({ success: true, data: results });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
