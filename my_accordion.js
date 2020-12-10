class Accordion {
  constructor(setting) {
    const defaultSetting = {
      // アコーディオンコンポーネントに付与するclass
      component: '.js-accordion',
      // アコーディオンのタブに付与するclass
      tabs: '.js-accordion-tab',
      // アコーディオンのパネルに付与するclass
      panels: '.js-accordion-panel',
      // アコーディオンのパネルの開閉時のtransitionを指定
      toggleAnimation: 'max-height ease-out .3s',
      // 複数開けるようにするか
      openMultiple: false,
      // 初期化時に最初のパネルを開いておくか
      openFirstItem: true,
    };

    this.setting = Object.assign(defaultSetting, setting);

    Object.keys(this.setting).forEach(key => {
      this[key] = this.setting[key];
    });

    this.selector = {
      component: Array.from(document.querySelectorAll(this.component)),
      tabs: Array.from(document.querySelectorAll(this.tabs)),
      panels: Array.from(document.querySelectorAll(this.panels)),
    };
  }

  // 初期化
  init() {
    // アコーディオンコンポーネントがページ上に無い場合は処理を終える
    if (!this.selector.component.length) {
      return;
    }

    // アコーディオンコンポーネントに属性を付与する
    this.setAttributes();

    // 1項目目を表示する設定をしている場合
    if (this.openFirstItem) {
      this.showFirstItem();
    }

    // タブがクリックされた際の処理
    this.toggleItem();
    
    // 画面の幅に変動があった際の処理
    this.adjustHeight();
  }

  // アコーディオンコンポーネントに属性を付与する処理
  setAttributes() {
    // アコーディオンコンポーネントのタブに付与する属性
    this.selector.tabs.forEach((tab, number) => {
      tab.setAttribute('id', `accordion-tab-number-${(number + 1)}`);
      tab.setAttribute('aria-expanded', false);
      tab.setAttribute('aria-controls', `accordion-panel-number-${(number + 1)}`);
    });

    // アコーディオンコンポーネントのパネルに付与する属性
    this.selector.panels.forEach((panel, number) => {
      panel.setAttribute('id', `accordion-panel-number-${(number + 1)}`);
      panel.setAttribute('aria-hidden', true);
      panel.setAttribute('aria-labelledby', `accordion-tab-number-${(number + 1)}`);
      panel.style.overflow = 'hidden';
      panel.style.maxHeight = '0px';
    });
  }

  // 最初の項目を表示する
  showFirstItem() {
    const firstItemsTab = this.selector.tabs[0];
    const firstItemsPanel = this.selector.panels[0];
    const firstItemsContentsHeight = firstItemsPanel.children[0].clientHeight;
    
    firstItemsTab.setAttribute('aria-expanded', true);
    firstItemsPanel.setAttribute('aria-hidden', false);
    firstItemsPanel.style.maxHeight = firstItemsContentsHeight + 'px';
  }

  // タブがクリック・タップされた時の処理
  toggleItem() {
    this.selector.tabs.forEach(tab => {
      tab.addEventListener('click', clickedTab => {
        const targetTab = document.getElementById(clickedTab.target.id);
        const targetPanel = document.querySelector(`[aria-labelledby='${clickedTab.target.id}']`);
        const isItemExpanded = targetTab.getAttribute('aria-expanded') === 'true';
        
        clickedTab.stopPropagation();
        clickedTab.preventDefault();

        // 複数選択可能の設定がされていない時は開いているパネルをすべて閉じる
        if (!this.openMultiple && !isItemExpanded) {
          this.closeAllItems();
        }
        
        // 開閉時にスライドを行う
        if (!isItemExpanded) {
          const contentHeight = targetPanel.children[0].clientHeight;
          targetPanel.style.maxHeight = contentHeight + 'px';
        } else {
          targetPanel.style.maxHeight = '0px';
        }
        
        if (this.toggleAnimation !== '' || this.toggleAnimation !== undefined) {
          targetPanel.style.transition = this.toggleAnimation;
        }

        // 開閉時にWAI-ARIAの属性値を切り替える
        targetTab.setAttribute('aria-expanded', !isItemExpanded);
        targetPanel.setAttribute('aria-hidden', isItemExpanded);
      });
    });
  }

  // すべての項目を閉じる
  closeAllItems() {
    this.selector.tabs.forEach(tab => {
      const targetTab = tab.getAttribute('id');
      const targetPanel = document.querySelector(`[aria-labelledby="${targetTab}"]`);
      
      tab.setAttribute('aria-expanded', false);
      
      targetPanel.setAttribute('aria-hidden', true);
      targetPanel.style.maxHeight = '0px';
    });
  }
  
  // レスポンシブでパネル内の高さが変動した時に高さを再計算する
  adjustHeight() {
    this.selector.panels.forEach(panel => {
      window.addEventListener('resize', () => {
        const isExpanded = panel.style.maxHeight !== '0px';
        
        // 開いているパネルの高さを再計算する
        if (isExpanded) {
          const resizedHeight = panel.children[0].clientHeight;
          panel.style.maxHeight = resizedHeight + 'px';
        }
        
        return;
      });
    });
  }
};