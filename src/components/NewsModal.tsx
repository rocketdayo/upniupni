import React from 'react';
import { X, Bell } from 'lucide-react';

export interface NewsUpdate {
  id: string;
  date: string;
  version?: string;
  title: string;
  category: 'アプデ' | 'イベント' | 'キャンペーン' | '重要';
  isNew?: boolean;
  content: string[];
}

export const UPDATE_NEWS_LIST: NewsUpdate[] = [
  {
    id: 'news-20260909-1',
    date: '2026/09/09',
    version: 'v3.5.0',
    title: '【超大型改修】最高峰「ZZランク」神昇解禁＆ホーム専用「神昇の祭壇」設置！',
    category: 'アプデ',
    isNew: true,
    content: [
      '【最高峰ZZランク『神昇覚醒』解禁！】神の領域に達した「神崩玉・藍染惣右介ZZ」「神虚・ウルキオラZZ」「極天創世・極エンマ神ZZ」など全13体の最高峰ZZランクキャラクターが登場！',
      '【ホーム画面専用『神昇の祭壇』ボタン設置】大辞典内ではなく、ホーム画面に直結する専用アクセスボタンおよびゴールド特設バナーを設置！いつでも祭壇へ直行して儀式を行えます。',
      '【神昇召喚の儀（ランダム降臨）】所持しているZ\'ランクキャラクター1体と「神昇の秘石」1個を捧げることで、全13体のZZキャラクターからランダムで1体が降臨！ベースキャラの育成Lv・技Lvが引き継がれ、重複時は限界突破+1！',
      '【神昇の秘石 獲得3大ルート実装！】①虚圏特設マップ（天蓋・崩玉次元の高難度ボス初クリア報酬）、②スコアアタック（週間ランキング上位＆累計スコア達成報酬）、③BLEACHリング交換所（限定3個）の3つのルートで獲得できます！',
      '【ZZランク専用デュアル必殺技】ZZランクだけの特権として、2つの異なる効果を併せ持つ「キャラ固有デュアル必殺技」を搭載！（例：なぞり消し＋特大でかぷに生成、全画面消滅＋フィーバー蓄積など）',
      '【必殺技仕様のバランス調整】通常〜Z\'ランクまでの必殺技を過剰な複合効果から「単一の明確な役割」へと洗練統一！ゲームの戦略性と駆け引きが大幅に向上しました。',
      '【フィーバー＆技ゲージの適正化】全味方技ゲージ即時100%を廃止しバランスの取れた割合上昇化！また、フィーバーチャージ技はフィーバー中の多重蓄積を無効化し、通常時のフィーバー突入支援技として適正化しました。',
      '【ステータスバランスの完全調和】全ランクのHP・攻撃力・スキル威力を数学的・光学的に黄金比率で再設計！インフレ崩壊を起こさず、かつZZの圧倒的な強さを体感できる緻密なバトルバランスを実現しました。',
      '【パッシブスキル実戦連動】種族ステータスUP・被ダメージカット・ぷに接続拡大・技ゲージUP・自動復活保険など、全キャラクターのパッシブスキルがバトル中に完全連動・発動するようになりました！'
    ]
  },
  {
    id: 'news-20260814-1',
    date: '2026/08/14',
    version: 'v3.2.0',
    title: '【緊急メンテ＆機能追加】Z\'ランク必殺技威力修正＆虚圏特別マップ2面追加！',
    category: '重要',
    isNew: false,
    content: [
      '【必殺技バランス修正】Z\'ランクの必殺技威力が一部低くなっていた問題を完全に修正！Z\'ランクにふさわしい最高峰の超絶威力を発揮するようになりました。',
      '【虚圏（ウェコムンド）特別マップ2面追加！】崩玉神殿の奥に「特別マップ1（虚夜宮 天蓋）」および「特別マップ2（崩玉次元絶対領域）」が追加！最凶の敵を撃破して大量のBLEACHリングを獲得しよう！',
      '【UI＆メニュー改善】画面下部に「設定・データ引き継ぎ」メニューを配置し、上部メニューの表示を整理しました。'
    ]
  },
  {
    id: 'news-20260811-3',
    date: '2026/08/11',
    version: 'v3.1.0',
    title: '【機能追加】安全な暗号化データ引き継ぎ＆設定メニュー実装！',
    category: 'アプデ',
    isNew: false,
    content: [
      '【高度なデータ引き継ぎ機能】任意パスワードとAES-GCM暗号化を採用した安心・安全なデータ移行システムを搭載！端末変更やデータ復元がいつでも可能になりました。',
      '【設定メニューの導入】データ移行・シリアルコード入力・遊び方・ニュース確認・PLAYER IDのコピーを1か所に集約した「設定メニュー」を追加！',
      '【ヘッダーUIの最適化】画面上部のレイアウトを整理し、各種通貨バッジが見やすくスッキリ配置されるよう改善しました。'
    ]
  },
  {
    id: 'news-20260811-2',
    date: '2026/08/11',
    version: 'v3.0.5',
    title: '【UI改善】所持金数値表示の最適化＆システム動作快適化！',
    category: 'アプデ',
    isNew: true,
    content: [
      '【数値表記の最適化】所持Yマネー・Yポイントなどの数量表示を「1.2万」「1.5億」などの小数第1位表記に対応！大桁の数値も一目で把握しやすくなりました。',
      '【動作パフォーマンス向上】不要な画面表示を整理し、全体的な処理スピードとアニメーション表示のレスポンスを向上させました。'
    ]
  },
  {
    id: 'news-20260811-1',
    date: '2026/08/11',
    version: 'v3.0.0',
    title: '【超大型コラボ】「TVアニメ BLEACH」コラボイベント開催！！',
    category: 'イベント',
    isNew: true,
    content: [
      '【BLEACHコラボガシャ】黒崎一護(卍解)・朽木ルキア・日番谷冬獅郎・藍染惣右介など超豪華コラボキャラクターがガシャに解禁！',
      '【コラボ限定マップ】屍魂界（ソウル・ソサエティ）を舞台にした特別イベントマップが登場！強敵ボスを倒して限定キャラをGETしよう！',
      '【新専用通貨『BLEACHリング』】イベントマップクリアで「BLEACHリング」を獲得！限定アイテムや育成素材と交換可能！',
      '【コラボ特効アビリティ】BLEACHキャラをチームに編成するとイベントでの与ダメージが超絶アップ！'
    ]
  },
  {
    id: 'news-20260803-2',
    date: '2026/08/03',
    version: 'v2.6.0',
    title: 'スコアタ頂点称号『神覇者』衝撃の超絶上方修正＆日曜集計受取機能！',
    category: 'アプデ',
    isNew: false,
    content: [
      '【神覇者の能力超絶強化】スコアアタック全サーバ1位の覇者に贈られる称号「神覇者」の効果が「攻撃力+100% / 最大HP+100% / 獲得Ypt+100%」に覚醒！全称号中・圧倒的最強の性能へ進化！',
      '【スコアタ日曜集計＆報酬受取】スコアアタック画面で毎週日曜日のランキング集計報酬（1位で10,000Ypt + 神ひっさつの秘伝書x5 + 超限界突破の書x3 + 称号「神覇者」）をボタン1つでその場で直接受け取れる機能を追加！'
    ]
  },
  {
    id: 'news-20260803-1',
    date: '2026/08/03',
    version: 'v2.5.0',
    title: '超難関LEGEND称号10種追加＆特大GET演出・大辞典スクロール改修！',
    category: 'アプデ',
    isNew: false,
    content: [
      '【極限やり込みLEGEND称号10種】「一億突破の絶対神」「Ypt兆万長者」「ぷにぷに界の創造主」など超高難易度のLEGEND称号が新たに10個登場！',
      '【称号GET演出】条件達成でホーム画面遷移時に特大「GET!!」ポップアップを表示！獲得効果の確認やその場で直接装備が可能に！',
      '【大辞典の画面全体スクロール】妖怪大辞典・称号大辞典ともに画面全体でスムーズにスクロールできるよう改善！リストを快適に一覧できます。',
      '【称号バフシステム】特定の称号を装着すると攻撃力UP・HPUP・Yptボーナスなどの専用アビリティ効果が発動！'
    ]
  },
  {
    id: 'news-20260802-2',
    date: '2026/08/03',
    version: 'v2.4.0',
    title: 'チームスロット無限拡張＆出撃直前デッキ切り替え！',
    category: 'アプデ',
    isNew: false,
    content: [
      '【チームスロット無制限拡張】ワイポイントを消費して編成デッキを無制限に拡張可能に！',
      '【出撃前デッキ選択】通常マップ・イベントマップの出撃前画面で登録デッキをサクサク切り替え！',
      '【ガシャ演出強化】1連・10連ガシャに「虹カプセル」とタップ開封アニメーションを追加！'
    ]
  },
  {
    id: 'news-20260802-1',
    date: '2026/08/02',
    version: 'v2.3.0',
    title: 'フィーバーフィニッシュ＆ド派手クリティカル追加！',
    category: 'アプデ',
    content: [
      '【FEVER FINISH!!】フィーバー終了時の蓄積ダメージ解放時に専用ド派手カットインを追加！',
      '【ダメージテキスト】大ダメージ時のフォントとシェイク振動演出を強化しました！'
    ]
  },
  {
    id: 'news-20260731-1',
    date: '2026/07/31',
    version: 'v2.2.0',
    title: '超限界突破＆ひっさつG実装！キャラ育成上限解放！',
    category: 'アプデ',
    content: [
      '【超限界突破の書】キャラクターの限界突破が最大+10まで解放可能に！',
      '【ひっさつGの書】技レベルの上限を突破し、威力と効果時間が超絶パワーアップ！',
      '【経験値玉】神けいけんちだま・超けいけんちだま等の育成アイテムを追加！'
    ]
  },
  {
    id: 'news-20260730-1',
    date: '2026/07/30',
    version: 'v2.1.0',
    title: '夏限定イベント「ぷにぷにサマービーチ」開催！',
    category: 'イベント',
    content: [
      '【イベントマップ】限定キャラ「サマーぷに」たちが登場する特別マップがOPEN！',
      '【サマーコインガシャ】イベント限定コインを集めて限定キャラをGETしよう！',
      '【特効キャラクター】イベント特効キャラを編成するとダメージやドロップ数が大幅UP！'
    ]
  },
  {
    id: 'news-20260729-1',
    date: '2026/07/29',
    version: 'v2.0.0',
    title: 'スコアアタック＆デイリーミッション＆シリアルコード機能！',
    category: 'アプデ',
    content: [
      '【スコアアタック】毎週ハイスコアを競い合うスコアアタックモードが登場！',
      '【デイリーミッション】毎日挑戦してYptや豪華育成アイテムを獲得しよう！',
      '【あいことば/シリアルコード】特別なコードを入力して限定プレゼントを獲得！'
    ]
  },
  {
    id: 'news-20260728-1',
    date: '2026/07/28',
    version: 'v1.5.0',
    title: 'ステージドロップ＆ひっさつの秘伝書ドロップ追加！',
    category: 'アプデ',
    content: [
      '【ステージドロップ】バトル勝利でキャラやけいけんちだまがドロップ！',
      '【秘伝書ドロップ】ボスステージ等の超低確率で「ひっさつの秘伝書」が手に入る！',
      '【称号システム】ミッション達成でオリジナル称号を獲得・装着可能に！'
    ]
  },
  {
    id: 'news-20260725-1',
    date: '2026/07/25',
    version: 'v1.0.0',
    title: '「妖怪パズルぷにぷに」正式サービス開始！',
    category: '重要',
    content: [
      '【グランドオープン】ぷにを繋げて大連鎖！爽快パズルゲームがスタート！',
      '【新ランク開放】SSSランク・Zランク妖怪がガシャに解禁！最強のチームを目指そう！'
    ]
  },
  {
    id: 'news-20260720-1',
    date: '2026/07/20',
    version: 'v0.9.0',
    title: '【クラシック時代】クローズドβテスト開催（SSS未実装時代）',
    category: 'アプデ',
    content: [
      '【最高ランクSS時代】当時はSSS・Zランクが存在せず、SSランクが最高峰レアリティとして登場！',
      '【初期スコアタ】フィーバータイムを活用したハイスコアチャレンジのプロトタイプをテスト。',
      '【ぷにサイズ調整】でかぷに作成時の連鎖倍率と整地バトルのバランスを調整。'
    ]
  },
  {
    id: 'news-20260715-1',
    date: '2026/07/15',
    version: 'v0.5.0',
    title: '【開発初期】アルファテスト＆パズルエンジン動作検証',
    category: 'アプデ',
    content: [
      '【物理エンジン試作】ぷにの繋ぎやすさ・タップでのサイズ拡大演出のプロトタイプを作成！',
      '【初期キャラ10体】ジバニャン・コマさん・ウィスパーをはじめとする初期メンバーの技演出テスト実施。'
    ]
  }
];

interface NewsModalProps {
  onClose: () => void;
}

export const NewsModal: React.FC<NewsModalProps> = ({ onClose }) => {
  const getCategoryBadge = (cat: NewsUpdate['category']) => {
    switch (cat) {
      case 'アプデ':
        return { bg: 'linear-gradient(135deg, #00c853 0%, #009688 100%)', text: 'アプデ' };
      case 'イベント':
        return { bg: 'linear-gradient(135deg, #ff007f 0%, #7928ca 100%)', text: 'イベント' };
      case 'キャンペーン':
        return { bg: 'linear-gradient(135deg, #ffaa00 0%, #ff5500 100%)', text: 'キャンペン' };
      case '重要':
        return { bg: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)', text: '重要' };
      default:
        return { bg: '#64748b', text: cat };
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          maxHeight: '82vh',
          background: 'linear-gradient(180deg, #1e1035 0%, #0f081d 100%)',
          borderRadius: '24px',
          border: '2px solid #ff007f',
          boxShadow: '0 0 30px rgba(255, 0, 127, 0.4), 0 10px 25px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(90deg, #ff007f 0%, #7928ca 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={22} color="#ffd700" />
            <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff', fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              アップデート＆お知らせ
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ニュース一覧 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          scrollbarWidth: 'thin'
        }}>
          {UPDATE_NEWS_LIST.map((item) => {
            const badge = getCategoryBadge(item.category);
            return (
              <div
                key={item.id}
                style={{
                  background: item.isNew
                    ? 'linear-gradient(135deg, rgba(255, 0, 127, 0.15) 0%, rgba(121, 40, 202, 0.15) 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: item.isNew ? '1px solid #ff007f' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  position: 'relative'
                }}
              >
                {/* 日付・バージョン・カテゴリ */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      background: badge.bg,
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 900,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      textShadow: '0 1px 2px rgba(0,0,0,0.4)'
                    }}>
                      {badge.text}
                    </span>
                    {item.version && (
                      <span style={{
                        background: 'rgba(255,255,255,0.15)',
                        color: '#ffd700',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '6px'
                      }}>
                        {item.version}
                      </span>
                    )}
                    {item.isNew && (
                      <span style={{
                        background: '#ff0055',
                        color: '#ffffff',
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        padding: '1px 6px',
                        borderRadius: '8px',
                        animation: 'pulse 1.5s infinite'
                      }}>
                        NEW!
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                    {item.date}
                  </span>
                </div>

                {/* タイトル */}
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.35 }}>
                  {item.title}
                </div>

                {/* 詳細内容 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                  {item.content.map((line, idx) => (
                    <div key={idx} style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4, display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                      <span style={{ color: '#ff77aa', flexShrink: 0 }}>•</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* フッター */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '8px 24px', fontSize: '0.85rem', width: '100%', maxWidth: '200px' }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
