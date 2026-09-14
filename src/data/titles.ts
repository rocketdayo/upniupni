export interface TitleEffect {
  atkPercent?: number;          // 全キャラ攻撃力 +X%
  hpPercent?: number;           // 全キャラHP +X%
  yPointPercent?: number;       // Yポイント獲得量 +X%
  moneyPercent?: number;        // マネー獲得量 +X%
  feverGaugeSpeed?: number;     // フィーバーゲージ上昇速度 +X%
  dropRatePercent?: number;     // アイテム・キャラドロップ率 +X%
  critRatePercent?: number;     // クリティカル率 +X%
  tribeAtkBonus?: { tribe: string; percent: number }; // 特定種族の攻撃力 +X%
  specialDescription: string;   // わかりやすい能力効果テキスト
}

export interface TitleInfo {
  id: string;
  name: string;
  description: string;
  rarity: 'Normal' | 'Rare' | 'SR' | 'SSR' | 'UR' | 'LEGEND';
  color: string;
  effect: TitleEffect;
  howToGet: string; // 詳細な入手方法
  category: '基本' | 'バトル' | '育成' | '収集' | 'スコアタ' | 'イベント' | '伝説';
}

export const ALL_TITLES: TitleInfo[] = [
  // --- 基本・初心者 ---
  {
    id: 'title_beginner',
    name: '新米妖怪レーサー',
    description: 'ぷにぷにの世界に足を踏み入れた証',
    rarity: 'Normal',
    color: '#9ca3af',
    category: '基本',
    effect: {
      hpPercent: 3,
      specialDescription: 'チーム全員の最大HP +3%'
    },
    howToGet: '初期から開放されている基本称号'
  },
  {
    id: 'title_puni_novice',
    name: 'ぷにぷに駆け出し',
    description: 'パズルの基本をマスターした初心者',
    rarity: 'Normal',
    color: '#9ca3af',
    category: '基本',
    effect: {
      atkPercent: 3,
      specialDescription: 'チーム全員の攻撃力 +3%'
    },
    howToGet: 'ノーマルステージ「さくらニュータウン 1」をクリア'
  },
  {
    id: 'title_y_saver',
    name: '貯金家',
    description: 'コツコツYポイントを貯め始めた証',
    rarity: 'Normal',
    color: '#9ca3af',
    category: '基本',
    effect: {
      yPointPercent: 5,
      specialDescription: 'バトル獲得Yポイント +5%'
    },
    howToGet: 'Yポイントを累計1,000pt以上獲得する'
  },

  // --- パズル・バトル系 ---
  {
    id: 'title_deka_artisan',
    name: 'でかぷに職人',
    description: '巨大なぷにを作り出す技術を持った者',
    rarity: 'Rare',
    color: '#60a5fa',
    category: 'バトル',
    effect: {
      feverGaugeSpeed: 8,
      specialDescription: 'フィーバーゲージ上昇速度 +8%'
    },
    howToGet: 'バトル中にサイズ10以上のでかぷにを累計10回作成'
  },
  {
    id: 'title_puni_master',
    name: 'ぷにぷにマスター',
    description: 'でかぷにを大量に繋ぎ消したつわもの',
    rarity: 'Rare',
    color: '#60a5fa',
    category: 'バトル',
    effect: {
      atkPercent: 5,
      hpPercent: 5,
      specialDescription: 'チーム全員の攻撃力 & 最大HP +5%'
    },
    howToGet: 'バトル中にでかぷにを累計50回以上作成する'
  },
  {
    id: 'title_combo_king',
    name: '連鎖の鬼',
    description: '目にも留まらぬスピードで連鎖を重ねる達人',
    rarity: 'SR',
    color: '#a855f7',
    category: 'バトル',
    effect: {
      feverGaugeSpeed: 15,
      critRatePercent: 5,
      specialDescription: 'フィーバーゲージ上昇速度 +15% / クリティカル率 +5%'
    },
    howToGet: '1回のバトルで10コンボ以上を達成する'
  },
  {
    id: 'title_fever_master',
    name: 'フィーバーロード',
    description: 'フィーバータイムを自在に支配する者',
    rarity: 'SR',
    color: '#a855f7',
    category: 'バトル',
    effect: {
      atkPercent: 10,
      feverGaugeSpeed: 10,
      specialDescription: '攻撃力 +10% / フィーバーゲージ上昇速度 +10%'
    },
    howToGet: 'フィーバータイムを累計20回以上発生させる'
  },
  {
    id: 'title_veteran_warrior',
    name: '百戦錬磨の勇士',
    description: '数々の熾烈なパズルバトルを勝ち抜いた猛者',
    rarity: 'SR',
    color: '#a855f7',
    category: 'バトル',
    effect: {
      atkPercent: 8,
      hpPercent: 12,
      specialDescription: '攻撃力 +8% / 最大HP +12%'
    },
    howToGet: 'ステージバトルで通算30回勝利する'
  },

  // --- 育成・強化系 ---
  {
    id: 'title_limit_breaker',
    name: '限界を超えし者',
    description: '超限界突破の書を使用しキャラの極限を引き出した証',
    rarity: 'SR',
    color: '#a855f7',
    category: '育成',
    effect: {
      atkPercent: 8,
      dropRatePercent: 5,
      specialDescription: 'チーム攻撃力 +8% / ドロップ率 +5%'
    },
    howToGet: 'アイテム「超限界突破の書」を1回以上使用する'
  },
  {
    id: 'title_move_master',
    name: 'ひっさつ極めし者',
    description: '妖怪の秘められた必殺技を極限まで鍛え上げた者',
    rarity: 'SR',
    color: '#a855f7',
    category: '育成',
    effect: {
      atkPercent: 12,
      specialDescription: 'チーム攻撃力 +12%'
    },
    howToGet: 'ひっさつ技レベルがMAX(Lv.7)のキャラを1体以上所持する'
  },
  {
    id: 'title_level_max',
    name: '覚醒の刻',
    description: '限界までレベルを鍛え上げた絆の結晶',
    rarity: 'SSR',
    color: '#ec4899',
    category: '育成',
    effect: {
      atkPercent: 12,
      hpPercent: 10,
      specialDescription: '全キャラ攻撃力 +12% / 最大HP +10%'
    },
    howToGet: 'レベルMAX(Lv.50以上)のキャラクターを所持する'
  },
  {
    id: 'title_secret_collector',
    name: '秘伝書マニア',
    description: '数々のひっさつの秘伝書を収集した研究家',
    rarity: 'SR',
    color: '#a855f7',
    category: '育成',
    effect: {
      dropRatePercent: 12,
      specialDescription: 'ドロップ率 +12%'
    },
    howToGet: '所持品に「ひっさつの秘伝書」を3個以上所持する'
  },

  // --- 種族特化系 ---
  {
    id: 'title_isamu_master',
    name: '勇猛なる獅子',
    description: 'イサマシ族の圧倒的武勇を率いる主将',
    rarity: 'Rare',
    color: '#ef4444',
    category: '収集',
    effect: {
      tribeAtkBonus: { tribe: 'イサマシ', percent: 15 },
      specialDescription: 'イサマシ族キャラの攻撃力 +15%'
    },
    howToGet: 'イサマシ族の妖怪を3体以上仲間にする'
  },
  {
    id: 'title_fushigi_master',
    name: '知恵の探求者',
    description: 'フシギ族の秘められた魔術を解き明かす者',
    rarity: 'Rare',
    color: '#3b82f6',
    category: '収集',
    effect: {
      tribeAtkBonus: { tribe: 'フシギ', percent: 15 },
      specialDescription: 'フシギ族キャラの攻撃力 +15%'
    },
    howToGet: 'フシギ族の妖怪を3体以上仲間にする'
  },
  {
    id: 'title_gouketu_master',
    name: '金剛の盾',
    description: 'ゴウケツ族の鉄壁の守りを体現せし者',
    rarity: 'Rare',
    color: '#f59e0b',
    category: '収集',
    effect: {
      tribeAtkBonus: { tribe: 'ゴウケツ', percent: 20 },
      specialDescription: 'ゴウケツ族キャラの攻撃力 +20%'
    },
    howToGet: 'ゴウケツ族の妖怪を3体以上仲間にする'
  },
  {
    id: 'title_purichi_lover',
    name: 'キュートなアイドル',
    description: 'プリチー族の愛らしさで世界を魅了する者',
    rarity: 'Rare',
    color: '#ec4899',
    category: '収集',
    effect: {
      tribeAtkBonus: { tribe: 'プリチー', percent: 15 },
      specialDescription: 'プリチー族キャラの攻撃力 +15%'
    },
    howToGet: 'プリチー族の妖怪を3体以上仲間にする'
  },
  {
    id: 'title_pokapoka_sun',
    name: '太陽の祝福',
    description: 'ポカポカ族の癒やしの光で味方を包み込む者',
    rarity: 'Rare',
    color: '#10b981',
    category: '収集',
    effect: {
      tribeAtkBonus: { tribe: 'ポカポカ', percent: 20 },
      specialDescription: 'ポカポカ族キャラの攻撃力 +20%'
    },
    howToGet: 'ポカポカ族の妖怪を3体以上仲間にする'
  },
  {
    id: 'title_usurakage_shadow',
    name: '宵闇の支配者',
    description: 'ウスラカゲ族の影に潜む暗殺者',
    rarity: 'Rare',
    color: '#8b5cf6',
    category: '収集',
    effect: {
      tribeAtkBonus: { tribe: 'ウスラカゲ', percent: 15 },
      specialDescription: 'ウスラカゲ族キャラの攻撃力 +15%'
    },
    howToGet: 'ウスラカゲ族の妖怪を3体以上仲間にする'
  },
  {
    id: 'title_bukimi_curse',
    name: '怪異の怪導',
    description: 'ブキミー族の奇々怪々な呪いを操る術士',
    rarity: 'Rare',
    color: '#a855f7',
    category: '収集',
    effect: {
      tribeAtkBonus: { tribe: 'ブキミー', percent: 15 },
      specialDescription: 'ブキミー族キャラの攻撃力 +15%'
    },
    howToGet: 'ブキミー族の妖怪を3体以上仲間にする'
  },
  {
    id: 'title_nyororon_dragon',
    name: '流天の龍神',
    description: 'ニョロロン族のしなやかで強靭な力を引き出す者',
    rarity: 'Rare',
    color: '#06b6d4',
    category: '収集',
    effect: {
      tribeAtkBonus: { tribe: 'ニョロロン', percent: 15 },
      specialDescription: 'ニョロロン族キャラの攻撃力 +15%'
    },
    howToGet: 'ニョロロン族の妖怪を3体以上仲間にする'
  },
  {
    id: 'title_enma_guard',
    name: 'エンマ親衛隊',
    description: 'エンマ大王に忠誠を誓いし誇り高き部隊',
    rarity: 'SR',
    color: '#f59e0b',
    category: '収集',
    effect: {
      tribeAtkBonus: { tribe: 'エンマ', percent: 25 },
      atkPercent: 5,
      specialDescription: 'エンマ族キャラの攻撃力 +25% / チーム攻撃力 +5%'
    },
    howToGet: 'エンマ族の妖怪を1体以上所持する'
  },
  {
    id: 'title_haguki_party',
    name: 'ハグキ党名誉党員',
    description: 'ハグキ族の熱きソウルを継承した特別会員',
    rarity: 'SR',
    color: '#84cc16',
    category: '収集',
    effect: {
      tribeAtkBonus: { tribe: 'ハグキ', percent: 30 },
      yPointPercent: 10,
      specialDescription: 'ハグキ族の攻撃力 +30% / 獲得Ypt +10%'
    },
    howToGet: 'ハグキ党キャラ（ハグキニャン等）を1体以上獲得する'
  },
  {
    id: 'title_jibanyan_fan',
    name: 'ジバニャン親衛隊',
    description: 'ジバニャンシリーズをこよなく愛する熱烈ファン',
    rarity: 'SR',
    color: '#f97316',
    category: '収集',
    effect: {
      atkPercent: 7,
      yPointPercent: 10,
      specialDescription: '攻撃力 +7% / 獲得Yポイント +10%'
    },
    howToGet: '名前に「ジバニャン」を含む妖怪を2体以上所持する'
  },

  // --- 収集・経済系 ---
  {
    id: 'title_y_rich',
    name: 'Yポイント大富豪',
    description: '膨大なYポイントを保有する超富豪',
    rarity: 'SSR',
    color: '#ec4899',
    category: '収集',
    effect: {
      yPointPercent: 25,
      moneyPercent: 15,
      specialDescription: '獲得Yポイント +25% / 獲得Yマネー +15%'
    },
    howToGet: '所持Yポイントが50,000pt以上になる'
  },
  {
    id: 'title_gacha_addict',
    name: 'ラッキーガチャマン',
    description: 'ガシャ回数が三桁に突入した幸運の引き強者',
    rarity: 'SSR',
    color: '#ec4899',
    category: '収集',
    effect: {
      yPointPercent: 15,
      dropRatePercent: 10,
      specialDescription: '獲得Yポイント +15% / ドロップ率 +10%'
    },
    howToGet: 'ガシャを累計30回以上引く'
  },
  {
    id: 'title_rainbow_miracle',
    name: '虹カプセルの奇跡',
    description: '極めて希少な最高ランク妖怪を引き当てた強運',
    rarity: 'UR',
    color: '#38bdf8',
    category: '収集',
    effect: {
      atkPercent: 15,
      critRatePercent: 10,
      specialDescription: '攻撃力 +15% / クリティカル率 +10%'
    },
    howToGet: 'ZランクまたはSSSランクのキャラクターを1体以上所持'
  },
  {
    id: 'title_encyclopedia_master',
    name: '妖怪大百科の完成者',
    description: '数多くの妖怪たちと固い絆を結んだ図鑑マスター',
    rarity: 'SSR',
    color: '#ec4899',
    category: '収集',
    effect: {
      atkPercent: 10,
      hpPercent: 10,
      dropRatePercent: 10,
      specialDescription: '全ステータス +10% / ドロップ率 +10%'
    },
    howToGet: '妖怪図鑑の登録数が20体以上に達する'
  },

  // --- スコアタ・イベント系 ---
  {
    id: 'title_score_champion',
    name: 'スコアタ王者',
    description: 'スコアアタックで絶大なハイスコアを叩き出した証',
    rarity: 'UR',
    color: '#38bdf8',
    category: 'スコアタ',
    effect: {
      atkPercent: 18,
      critRatePercent: 10,
      specialDescription: 'チーム攻撃力 +18% / クリティカル率 +10%'
    },
    howToGet: 'スコアアタックでスコア5,000,000点以上を獲得'
  },
  {
    id: 'title_summer_vacation',
    name: 'サマービーチの思い出',
    description: '夏のビーチイベントを全力で楽しんだ熱い夏の証',
    rarity: 'Rare',
    color: '#06b6d4',
    category: 'イベント',
    effect: {
      yPointPercent: 12,
      specialDescription: '獲得Yポイント +12%'
    },
    howToGet: 'サマービーチイベントステージを1つ以上クリアする'
  },
  {
    id: 'title_summer_ruler',
    name: '常夏の支配者',
    description: 'サマーイベントの最深部ボスを撃破した夏のアニキ',
    rarity: 'SSR',
    color: '#ec4899',
    category: 'イベント',
    effect: {
      atkPercent: 12,
      yPointPercent: 20,
      specialDescription: '攻撃力 +12% / 獲得Yポイント +20%'
    },
    howToGet: 'サマービーチイベントのボスステージ「ST-5」をクリア'
  },

  // --- 伝説・エンドコンテンツ ---
  {
    id: 'title_map_cleared',
    name: 'さくらニュータウンの英雄',
    description: '通常マップの試練をすべて突破した救世主',
    rarity: 'UR',
    color: '#38bdf8',
    category: '伝説',
    effect: {
      atkPercent: 15,
      hpPercent: 15,
      specialDescription: '全キャラ攻撃力 & 最大HP +15%'
    },
    howToGet: 'ノーマルマップのすべてのステージをクリア'
  },
  {
    id: 'title_god_slayer',
    name: '神覇者',
    description: 'スコアアタックの頂点に君臨せし者だけに許された究極・無敵の覇者称号',
    rarity: 'LEGEND',
    color: '#ffd700',
    category: '伝説',
    effect: {
      atkPercent: 100,
      hpPercent: 100,
      yPointPercent: 100,
      specialDescription: 'チーム攻撃力 +100% / 最大HP +100% / 獲得Ypt +100%'
    },
    howToGet: 'スコアアタックで全サーバ1位を達成する（毎週日曜日集計配布）'
  },
  {
    id: 'title_legend_puni_god',
    name: 'ぷにぷに神',
    description: 'あらゆる称号と試練を克服し神の領域に達した唯一無二の存在',
    rarity: 'LEGEND',
    color: '#e11d48',
    category: '伝説',
    effect: {
      atkPercent: 30,
      hpPercent: 30,
      yPointPercent: 50,
      dropRatePercent: 25,
      specialDescription: '全ステータス +30% / 獲得Ypt +50% / ドロップ率 +25%'
    },
    howToGet: '開放可能な称号を15種類以上所持する'
  },

  // --- 超難関LEGENDエンドコンテンツ (やり込み限定) ---
  {
    id: 'legend_billion_god',
    name: '一億突破の絶対神',
    description: 'スコアアタックで前人未到の1億点という神の領域を打ち立てた超人',
    rarity: 'LEGEND',
    color: '#e11d48',
    category: 'スコアタ',
    effect: {
      atkPercent: 35,
      critRatePercent: 20,
      specialDescription: 'チーム攻撃力 +35% / クリティカル率 +20%'
    },
    howToGet: 'スコアアタックでスコア100,000,000点(1億点)以上を記録'
  },
  {
    id: 'legend_kei_god_creator',
    name: '百京神話の創世神',
    description: 'スコアアタックで100京(10^18)ptを突破し、最強のUZ+++をも目覚めさせた創世の神',
    rarity: 'LEGEND',
    color: '#ffd700',
    category: 'スコアタ',
    effect: {
      atkPercent: 200,
      hpPercent: 200,
      yPointPercent: 200,
      critRatePercent: 50,
      specialDescription: '全ステータス +200% / 獲得Ypt +200% / クリティカル +50%'
    },
    howToGet: 'スコアアタックで100京pt以上を達成'
  },
  {
    id: 'legend_gai_overlord',
    name: '百垓無双の覇王',
    description: '100垓(10^22)ptの超弩級スコアを叩き出し全宇宙を震わせた覇王',
    rarity: 'LEGEND',
    color: '#ffd700',
    category: 'スコアタ',
    effect: {
      atkPercent: 300,
      hpPercent: 300,
      yPointPercent: 300,
      critRatePercent: 70,
      specialDescription: '全ステータス +300% / 獲得Ypt +300% / クリティカル +70%'
    },
    howToGet: 'スコアアタックで100垓pt以上を達成'
  },
  {
    id: 'legend_jou_ruler',
    name: '百穣銀河の支配者',
    description: '100穣(10^30)ptという天文学的極限スコアを統べる銀河の支配者',
    rarity: 'LEGEND',
    color: '#ffd700',
    category: 'スコアタ',
    effect: {
      atkPercent: 500,
      hpPercent: 500,
      yPointPercent: 500,
      critRatePercent: 100,
      specialDescription: '全ステータス +500% / 獲得Ypt +500% / 確定クリティカル'
    },
    howToGet: 'スコアアタックで100穣pt以上を達成'
  },
  {
    id: 'legend_goku_transcendent',
    name: '百極次元の超越神',
    description: '100極(10^50)ptの次元を突破し理を創り変えた絶対超越神',
    rarity: 'LEGEND',
    color: '#ffd700',
    category: 'スコアタ',
    effect: {
      atkPercent: 1000,
      hpPercent: 1000,
      yPointPercent: 1000,
      critRatePercent: 100,
      specialDescription: '全ステータス +1000% / 獲得Ypt +1000% / 神威確定クリティカル'
    },
    howToGet: 'スコアアタックで100極pt以上を達成'
  },
  {
    id: 'legend_muryotaisu_omnipotent',
    name: '無量大数の絶対全能神',
    description: '1無量大数(10^68)ptの頂に君臨し、数の概念すら超えた究極全知全能の最高神',
    rarity: 'LEGEND',
    color: '#ffd700',
    category: 'スコアタ',
    effect: {
      atkPercent: 5000,
      hpPercent: 5000,
      yPointPercent: 5000,
      critRatePercent: 100,
      specialDescription: '全ステータス +5000% / 獲得Ypt +5000% / 宇宙創生神威'
    },
    howToGet: 'スコアアタックで1無量大数pt以上を達成'
  },
  {
    id: 'legend_y_mega_rich',
    name: 'Ypt兆万長者',
    description: '果てしない努力の末に膨大なYポイントの大財宝を築き上げた大富豪',
    rarity: 'LEGEND',
    color: '#e11d48',
    category: '収集',
    effect: {
      yPointPercent: 100,
      moneyPercent: 50,
      specialDescription: '獲得Yポイント +100% / 獲得Yマネー +50%'
    },
    howToGet: '所持Yポイントが100,000pt以上を突破する'
  },
  {
    id: 'legend_gacha_emperor',
    name: '神引きの覇王',
    description: 'ガシャの嵐を幾度となく潜り抜け、奇跡を引き寄せ続けた伝説のガシャ神',
    rarity: 'LEGEND',
    color: '#e11d48',
    category: '収集',
    effect: {
      atkPercent: 25,
      hpPercent: 25,
      dropRatePercent: 30,
      specialDescription: '全ステータス +25% / アイテムドロップ率 +30%'
    },
    howToGet: 'ガシャを累計100回以上引く'
  },
  {
    id: 'legend_ultra_stage_master',
    name: '全界の超征服者',
    description: '裏世界・ウラステージを含む全マップの猛悪な強敵を完封した真の勇者',
    rarity: 'LEGEND',
    color: '#e11d48',
    category: '伝説',
    effect: {
      atkPercent: 30,
      hpPercent: 30,
      feverGaugeSpeed: 20,
      specialDescription: 'チーム攻撃力 & 最大HP +30% / フィーバー速度 +20%'
    },
    howToGet: 'ウラステージを含む全ステージを完全攻略クリアする'
  },
  {
    id: 'legend_ultimate_limit',
    name: '限界突破の極意',
    description: 'キャラクターの隠された潜在能力を超極限まで研ぎ澄ませた至高の伝承者',
    rarity: 'LEGEND',
    color: '#e11d48',
    category: '育成',
    effect: {
      atkPercent: 40,
      specialDescription: 'チーム全員の攻撃力 +40%'
    },
    howToGet: 'キャラクターの限界突破レベルを+3以上にする、または累計3体に超限界突破を行う'
  },
  {
    id: 'legend_god_skill_master',
    name: '神技の体得者',
    description: '神ひっさつの秘伝書と超限界突破の書を大量に収蔵した奥義の大家',
    rarity: 'LEGEND',
    color: '#e11d48',
    category: '育成',
    effect: {
      atkPercent: 35,
      dropRatePercent: 25,
      specialDescription: 'チーム攻撃力 +35% / ドロップ率 +25%'
    },
    howToGet: '「神ひっさつの秘伝書」および「超限界突破の書」を各2個以上所持する'
  },
  {
    id: 'legend_z_legion',
    name: 'Zランク絶神軍団',
    description: '次元を凌駕する最高峰のZランク妖怪たちを従えし絶対的君主',
    rarity: 'LEGEND',
    color: '#e11d48',
    category: '収集',
    effect: {
      atkPercent: 40,
      hpPercent: 25,
      specialDescription: 'チーム攻撃力 +40% / 最大HP +25%'
    },
    howToGet: 'Zランク（最高レア）の妖怪を2体以上仲間にする'
  },
  {
    id: 'legend_combo_god',
    name: '神速の千連鎖',
    description: 'パズル盤面で超絶スピードの連鎖を叩き出し続ける神速の指先',
    rarity: 'LEGEND',
    color: '#e11d48',
    category: 'バトル',
    effect: {
      feverGaugeSpeed: 50,
      critRatePercent: 25,
      specialDescription: 'フィーバーゲージ上昇速度 +50% / クリティカル率 +25%'
    },
    howToGet: '1バトルで25コンボ以上を達成する'
  },
  {
    id: 'legend_fever_god',
    name: '永劫のフィーバー',
    description: 'フィーバータイムを幾度となく発生させ戦場を永遠に支配する覇者',
    rarity: 'LEGEND',
    color: '#e11d48',
    category: 'バトル',
    effect: {
      atkPercent: 30,
      feverGaugeSpeed: 30,
      specialDescription: 'チーム攻撃力 +30% / フィーバー上昇速度 +30%'
    },
    howToGet: 'フィーバータイムを累計100回以上発生させる'
  },
  {
    id: 'legend_puni_supreme',
    name: 'ぷにぷに界の創造主',
    description: '全ゲームコンテンツを究めて頂点に君臨した伝説の中の全知全能',
    rarity: 'LEGEND',
    color: '#e11d48',
    category: '伝説',
    effect: {
      atkPercent: 50,
      hpPercent: 50,
      yPointPercent: 100,
      dropRatePercent: 50,
      specialDescription: '全ステータス +50% / 獲得Ypt +100% / ドロップ率 +50%'
    },
    howToGet: '開放可能な称号を25種類以上獲得する'
  },

  // --- スコアタ100京 & UZ+++ 究極創世称号 ---
  {
    id: 'legend_hyakkei_genesis',
    name: '百京神話の創世神',
    description: 'スコアアタックで100京(10^18)ptという人智を超越した神話スコアを刻み、神をも統べる絶対的創世主',
    rarity: 'LEGEND',
    color: '#ffd700',
    category: '伝説',
    effect: {
      atkPercent: 1000,
      hpPercent: 1000,
      yPointPercent: 1000,
      dropRatePercent: 100,
      critRatePercent: 100,
      feverGaugeSpeed: 100,
      specialDescription: '全キャラ攻撃力・HP・Ypt・スコア 1,000%UP / クリティカル＆ドロップ率超極大上昇'
    },
    howToGet: 'スコアアタックでスコア100京(10^18)pt以上を記録する'
  },
  {
    id: 'legend_uz_god_supreme',
    name: '【UZ+++降臨】神創絶神・天照極エンマ王',
    description: '宇宙の始祖たる光を纏い、あらゆる邪悪を消滅せしめる全知全能の最高神称号',
    rarity: 'LEGEND',
    color: '#ff007f',
    category: '伝説',
    effect: {
      atkPercent: 500,
      hpPercent: 500,
      yPointPercent: 500,
      dropRatePercent: 50,
      specialDescription: '全キャラ攻撃力＆HP +500% / 獲得Ypt +500% / ドロップ率 +50%'
    },
    howToGet: 'キャラクター「神創絶神・天照極エンマ王UZ+++」を獲得する'
  },
  {
    id: 'legend_ascended_god',
    name: '神昇せし超越者',
    description: '神昇の祭壇にて限界の殻を破り、ZZランクへの昇華を成し遂げた超越の証',
    rarity: 'LEGEND',
    color: '#ffd700',
    category: '育成',
    effect: {
      atkPercent: 50,
      hpPercent: 50,
      yPointPercent: 50,
      specialDescription: 'チーム攻撃力 & 最大HP +50% / 獲得Ypt +50%'
    },
    howToGet: 'キャラクターを神昇の祭壇にてZZランクへ神昇覚醒させる'
  },

  // --- BLEACHコラボ・イベント称号 ---
  {
    id: 'title_bleach_yamamoto',
    name: '護廷十三隊総隊長',
    description: '千年にわたり尸魂界の頂点に君臨した最強の死神の証',
    rarity: 'UR',
    color: '#38bdf8',
    category: 'イベント',
    effect: {
      tribeAtkBonus: { tribe: 'イサマシ', percent: 50 },
      atkPercent: 30,
      specialDescription: 'イサマシ族攻撃力 +50% / チーム攻撃力 +30%'
    },
    howToGet: '「山本元柳斎重國」を仲間にする'
  },
  {
    id: 'title_bleach_aizen_hogyoku',
    name: '崩玉との融合',
    description: '死神と虚の境界を超越し、天に立ちし超越者の証明',
    rarity: 'UR',
    color: '#38bdf8',
    category: 'イベント',
    effect: {
      atkPercent: 40,
      hpPercent: 40,
      yPointPercent: 30,
      specialDescription: 'チーム攻撃力 & 最大HP +40% / 獲得Ypt +30%'
    },
    howToGet: '「藍染惣右介(崩玉融合)」を獲得する'
  },
  {
    id: 'title_bleach_aizen',
    name: '虚圏の統括者',
    description: '冷徹な知謀と圧倒的な力で虚圏を支配した反逆の覇者',
    rarity: 'SSR',
    color: '#ec4899',
    category: 'イベント',
    effect: {
      atkPercent: 25,
      hpPercent: 25,
      specialDescription: 'チーム攻撃力 & 最大HP +25%'
    },
    howToGet: '「藍染惣右介」を仲間にする'
  },
  {
    id: 'title_bleach_ichigo_bankai',
    name: '卍解の極致',
    description: '漆黒の刃と超速の斬撃で運命を切り拓く死神の真髄',
    rarity: 'SSR',
    color: '#ec4899',
    category: 'イベント',
    effect: {
      atkPercent: 25,
      critRatePercent: 15,
      specialDescription: 'チーム攻撃力 +25% / クリティカル率 +15%'
    },
    howToGet: '「黒崎一護(卍解)」を仲間にする'
  },
  {
    id: 'title_bleach_shinigami',
    name: '死神代行',
    description: '尸魂界と現世を繋ぎ、仲間を守るために戦う代理死神',
    rarity: 'SR',
    color: '#a855f7',
    category: 'イベント',
    effect: {
      atkPercent: 15,
      feverGaugeSpeed: 15,
      specialDescription: 'チーム攻撃力 +15% / フィーバー上昇速度 +15%'
    },
    howToGet: 'BLEACHコラボキャラクターを1体以上仲間にする'
  },

  // --- シリアルコード・特典称号 ---
  {
    id: 'title_skip_all',
    name: '通常ステージ全開放',
    description: 'シリアルコードによってすべての通常ステージを開放した特権者',
    rarity: 'UR',
    color: '#38bdf8',
    category: '基本',
    effect: {
      atkPercent: 25,
      hpPercent: 25,
      yPointPercent: 25,
      specialDescription: 'チーム攻撃力 & 最大HP +25% / 獲得Ypt +25%'
    },
    howToGet: 'シリアルコード「STAGE-CLEAR-ALL」を入力する'
  },
  {
    id: 'title_skip_10',
    name: '通常ステージ10進む',
    description: 'シリアルコードによってステージを一気に突破した快速の証',
    rarity: 'SR',
    color: '#a855f7',
    category: '基本',
    effect: {
      atkPercent: 15,
      hpPercent: 10,
      specialDescription: 'チーム攻撃力 +15% / 最大HP +10%'
    },
    howToGet: 'シリアルコード「STAGE-SKIP-10」を入力する'
  },
  {
    id: 'title_skip_5',
    name: '通常ステージ5進む',
    description: 'シリアルコードの恩恵を受けし冒険者',
    rarity: 'Rare',
    color: '#60a5fa',
    category: '基本',
    effect: {
      atkPercent: 10,
      hpPercent: 5,
      specialDescription: 'チーム攻撃力 +10% / 最大HP +5%'
    },
    howToGet: 'シリアルコード「STAGE-SKIP-5」を入力する'
  },
  {
    id: 'title_skip_1',
    name: '通常ステージ1進む',
    description: 'シリアルコードを初めて試した冒険の始まり',
    rarity: 'Normal',
    color: '#9ca3af',
    category: '基本',
    effect: {
      atkPercent: 5,
      specialDescription: 'チーム全員の攻撃力 +5%'
    },
    howToGet: 'シリアルコード「STAGE-SKIP-1」を入力する'
  }
];

/**
 * 称号IDまたは称号名からTitleInfoを取得する (未定義のカスタム称号もフォールバック生成)
 */
export const getTitleInfo = (titleIdOrName: string): TitleInfo | undefined => {
  if (!titleIdOrName) return undefined;
  const found = ALL_TITLES.find(t => t.id === titleIdOrName || t.name === titleIdOrName);
  if (found) return found;

  // プレイヤーが保有している動的・特別称号に対するフォールバック
  return {
    id: `custom_${titleIdOrName}`,
    name: titleIdOrName,
    description: `特別な試練または特典により解禁された限定称号「${titleIdOrName}」`,
    rarity: titleIdOrName.includes('神') || titleIdOrName.includes('UZ') ? 'LEGEND' : 'UR',
    color: titleIdOrName.includes('神') ? '#ffd700' : '#38bdf8',
    category: '伝説',
    effect: {
      atkPercent: 20,
      hpPercent: 20,
      yPointPercent: 20,
      specialDescription: 'チーム全員の攻撃力・HP・獲得Ypt +20%'
    },
    howToGet: '特別イベントまたはシリアルコード達成'
  };
};

/**
 * プレイヤーの所持称号も含めた完全な称号リストを取得する
 */
export const getCompleteTitleList = (unlockedTitles: string[] = []): TitleInfo[] => {
  const titles = [...ALL_TITLES];
  const registeredNames = new Set(titles.map(t => t.name));

  unlockedTitles.forEach(unlockedName => {
    if (!registeredNames.has(unlockedName)) {
      const dynamicInfo = getTitleInfo(unlockedName);
      if (dynamicInfo) {
        titles.push(dynamicInfo);
        registeredNames.add(unlockedName);
      }
    }
  });

  return titles;
};

/**
 * 装備中の称号の効果を取得する
 */
export const getTitleEffect = (titleIdOrName: string): TitleEffect | null => {
  const info = getTitleInfo(titleIdOrName);
  return info ? info.effect : null;
};
