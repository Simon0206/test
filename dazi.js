function formatDate(date) {  
  let dateStr = date.getFullYear() + '-' +   
                (date.getMonth() + 1) + '-' +   
                date.getDate() + ' ' +   
                date.getHours() + ':' +   
                (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());  
  return dateStr;  
} 
let page
let db =wx.cloud.database()
let _ = db.command
Page({
  data: {
    testlist: [],
    searchKey:null, 
    switch_1:0,
    filterOptions: ['','音乐', '游戏', '追星','影视','学习','购物','美食','摄影','旅游','运动','购物','萌宠'],
    filterIndex: 0, 
  },

  handleSubmit(e) {  
    console.log('执行')
    const filterIndex = this.data.filterIndex;  
    const filterValue = this.data.filterOptions[filterIndex];  
    this.filterData(filterValue);  
  },
  
  handleFilterChange(e) {  
  this.setData({  
  filterIndex: e.detail.value  
  });  
  },
  
  filterData(filterValue) {  
    this.setData({ testlist: [] });  
    this.loadFilteredData(filterValue, 0); 
  },  
  
  loadFilteredData(filterValue, page) {  
    const db = wx.cloud.database();  
    const _ = db.command;  
    db.collection('req')  
      .where({  
        way: db.RegExp({ regexp: filterValue, options: 'i' })  
      })  
      .skip(page * 20) // 假设每页加载20条数据  
      .limit(20) // 限制每次加载的数据量  
      .get()  
      .then(res => {  
        // 处理加载到的数据，并更新到页面上  
        const newData = res.data.map(item => {  
          if (item.date) {  
            return { ...item, date: formatDate(item.date) };  
          } else {  
            return item;  
          }  
        });  
        this.setData({  
          testlist: this.data.testlist.concat(newData)  
        });  
        })  
      .catch(err => {  
        console.error('加载数据失败', err);  
      });  
  }, 
  
  //搜索
  getkey(e){
    this.setData({
      searchKey:e.detail.value
    })
  },

  searchSubmit(){
    let page = 0
    console.log(this.data.searchKey)
    if(this.data.searchKey){
      this.setData({
        switch_1:1
      })
      db.collection('req')
      .where(_.or([{
        title: db.RegExp({
          regexp: this.data.searchKey,
          options: 'i',
        })
      },
      {
        content: db.RegExp({
          regexp: this.data.searchKey,
          options: 'i',
        })
      }
    ]))
    .orderBy('sendTime','desc')
    .get()
    .then(res => {  
      let testlist = res.data.map(item => {  
        if (item.date) {  
          return { ...item, date: formatDate(item.date) };  
        } else {  
          return item;  
        }  
      });         
      this.setData({  
        testlist  
      });  
    })  
  }  
    else{
      wx.showToast({
        icon:'error',
        title: '请输入内容',
      })
    }
  },

// 刷新
  getlist(){
    wx.cloud.database().collection('req')
      .skip(20 * page)
      .orderBy('sendTime','desc').get()
      .then(res => {
        console.log('请求成功',res)
        wx.stopPullDownRefresh()
        wx.showToast({
          icon:'none',
          title: '刷新成功'
        })
        let testlist = this.data.testlist.concat(res.data.map(item => {  
          if (item.date) {  
            return { ...item, date: formatDate(item.date) };  
          } 
          else {  
            return item;  
          }  
        }));     
        this.setData({  
          testlist  
        });  
      })    
      .catch(res => {
        console.log('请求失败',res)
      })
  },

// 加载
  loading(){
    wx.cloud.database().collection('req')
    .skip(20 * page)
    .orderBy('sendTime','desc').get()
    .then(res => {
      let datalist = res.data
      if (datalist.length <= 0){
        wx.showToast({
          icon: 'none',
          title: '我是有底线的',
        })
      }
      let testlist = this.data.testlist.concat(datalist.map(item => {  
      if (item.date) {  
        return { ...item, date: formatDate(item.date) };  
      } else {  
        return item;  
      }  
    }));  
      this.setData({  
      testlist  
    });  
  })  
    .catch(res => {
      console.log('请求失败',res)
    })
  },

// 监听加载
    onLoad: function (options) {
      page = 0
      this.loading()
    },

// 监听下拉
    onPullDownRefresh: function () {
      console.log(this.data.switch_1)
      page = 0
      this.setData({
        testlist: [],
        switch_1:0,
        searchKey:null
      });
      this.getlist()
    },

// 上拉触底
    onReachBottom: function () {
      if(this.data.switch_1 == 1){
        page++
        wx.cloud.database().collection('req')
        .skip(20 * page)
        .where(_.or([{
          title: db.RegExp({
            regexp: this.data.searchKey,
            options: 'i',
          })
        },
        {
          content: db.RegExp({
            regexp: this.data.searchKey,
            options: 'i',
          })
        }
      ]))
        .orderBy('sendTime','desc').get()
        .then(res => {
          let datalist = res.data
          if (datalist.length <= 0){
            wx.showToast({
              icon: 'none',
              title: '我是有底线的',
            })
          }
           let testlist = this.data.testlist.concat(datalist.map(item => {  
      if (item.date) {  
        return { ...item, date: formatDate(item.date) };  
      } else {  
        return item;  
      }  
    }));  
    this.setData({  
      testlist  
    });  
  })  
    }
      else{
        page++,
        this.loading()
      }
    }
  })
