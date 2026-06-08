// ダミー生成用のリスト（脈診と主病証を分けて管理）
const allMyaku = ["浮脈","沈脈","遅脈","数脈","虚脈","実脈","伏脈","疾脈","滑脈","渋脈","短脈","長脈","弦脈","緊脈","細脈","微脈","洪脈","結脈","代脈","促脈","緩脈","芤脈","革脈","濡脈","弱脈","散脈","動脈","牢脈"];

const allByou = ["表証","虚証","裏証","寒証","熱証","実証","陽衰","激痛","熱盛","陽極","痰湿","食滞","血瘀","気鬱","気虚","陽気有余","肝胆病","痛証","痰飲","実寒","血虚","積聚","臓気の衰退","気滞","湿証","脾虚","失血","傷陰","精血虚損","気血両虚","元気離散","驚証","陰寒内実","疝痛"];

// 画像1・画像2に基づくデータ
const tableData = [
  { myaku: ["浮脈"], content: "軽く指を当てると拍動を感じるもの", byou: ["表証", "虚証"], emptyMyaku: true, emptyByou: true },
  { myaku: ["沈脈"], content: "筋・骨まで按じて拍動を感じるもの", byou: ["裏証"], emptyMyaku: true, emptyByou: true },
  { myaku: ["遅脈"], content: "1呼吸に3拍以下のもの", byou: ["寒証"], emptyMyaku: true, emptyByou: true },
  { myaku: ["数脈"], content: "1呼吸に6拍以上のもの", byou: ["熱証"], emptyMyaku: true, emptyByou: true },
  { myaku: ["虚脈"], content: "浮・中・沈いずれも無力なもの", byou: ["虚証"], emptyMyaku: true, emptyByou: true },
  { myaku: ["実脈"], content: "浮・中・沈いずれも力強いもの", byou: ["実証"], emptyMyaku: true, emptyByou: true },
  { myaku: ["伏脈"], content: "骨につくほど重按して触れるもの", byou: ["寒証", "陽衰", "激痛"], emptyMyaku: true, emptyByou: true },
  { myaku: ["疾脈"], content: "1呼吸に7，8拍以上のもの", byou: ["熱盛", "陽極"], emptyMyaku: true, emptyByou: true },
  { myaku: ["滑脈"], content: "円滑に指に触れるもの", byou: ["痰湿", "食滞"], emptyMyaku: true, emptyByou: true },
  { myaku: ["渋脈"], content: "ざらざらとして渋滞したようなもの", byou: ["血瘀"], emptyMyaku: true, emptyByou: true },
  { myaku: ["短脈"], content: "脈の長さが、寸・関・尺に満たないもの", byou: ["気鬱", "気虚"], emptyMyaku: true, emptyByou: true },
  { myaku: ["長脈"], content: "脈の長さが、寸・関・尺を超えるもの", byou: ["陽気有余"], emptyMyaku: true, emptyByou: true },
  { myaku: ["弦脈"], content: "長く真っすぐで緊張したもの", byou: ["肝胆病", "痛証", "痰飲"], emptyMyaku: true, emptyByou: true },
  { myaku: ["緊脈"], content: "張った縄に触れたような、緊張して有力なもの", byou: ["実寒", "痛証"], emptyMyaku: true, emptyByou: true },
  { myaku: ["細脈"], content: "脈幅小さく、細いが指に感じられるもの", byou: ["血虚"], emptyMyaku: true, emptyByou: true },
  { myaku: ["微脈"], content: "極めて細く、軟らかく拍動ははっきりしない", byou: ["虚証", "陽衰"], emptyMyaku: true, emptyByou: true },
  { myaku: ["洪脈"], content: "拍動が勢いよく触れ、脈幅が大きいもの", byou: ["熱盛"], emptyMyaku: true, emptyByou: true },
  { myaku: ["結脈"], content: "脈拍がやや遅く、不規則に時々止まるもの", byou: ["血瘀", "寒証", "積聚"], emptyMyaku: true, emptyByou: true },
  { myaku: ["代脈"], content: "脈拍が規則的に止まるもの", byou: ["臓気の衰退", "痛証"], emptyMyaku: true, emptyByou: true },
  { myaku: ["促脈"], content: "脈拍が速く、不規則に時々止まるもの", byou: ["熱盛", "気滞", "血瘀", "痰湿"], emptyMyaku: true, emptyByou: true },
  { myaku: ["緩脈"], content: "1呼吸に4拍で、遅脈より少し速いもの", byou: ["湿証", "脾虚"], emptyMyaku: true, emptyByou: true },
  
  // 画像2で最初から埋まっている箇所は emptyMyaku/emptyByou を false にする
  { myaku: ["芤脈"], content: "浮位で触れ、脈幅大きく脈中が空虚なもの", byou: ["失血", "傷陰"], emptyMyaku: false, emptyByou: false },
  { myaku: ["革脈"], content: "弦脈と芤脈を合わせたようなもの", byou: ["精血虚損"], emptyMyaku: false, emptyByou: false },
  
  { myaku: ["濡脈"], content: "浮位で触れ、脈幅が小さく軟らかい", byou: ["湿証", "虚証"], emptyMyaku: true, emptyByou: true },
  { myaku: ["弱脈"], content: "沈位で触れ、脈幅が小さく軟らかい", byou: ["気血両虚"], emptyMyaku: true, emptyByou: true },
  
  { myaku: ["散脈"], content: "拍動のリズムが一定せず、按じると消える", byou: ["元気離散"], emptyMyaku: false, emptyByou: false },
  { myaku: ["動脈"], content: "脈の長さが非常に短く、関の1点に触れる", byou: ["痛証", "驚証"], emptyMyaku: false, emptyByou: false },
  { myaku: ["牢脈"], content: "拍動が強く有力なもの", byou: ["陰寒内実", "疝痛"], emptyMyaku: false, emptyByou: false }
];
