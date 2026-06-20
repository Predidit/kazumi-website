# 规则示例

上一篇文章的规则开发教程所用到的网站 https://www.dm539.com/  其规则如下：  
由上至下分别对应软件规则编辑界面中的9行
```
樱花动漫
1.0
https://www.dm539.com/
https://www.dm539.com/search/-------------.html?wd=@keyword&submit=
//div[1]/div/div[1]/div/div/div[2]/ul//li
//div[2]/h4/a
//div[2]/p[5]/a[2]
//div[2]/div[3]/div[1]/div[1]/div/div[2]//div
//ul/li/a
```

现在，让我们来看一个比较特殊的网站：https://www.akianime.cc/    
在这个网站中，搜索界面是没有详情按钮的，但是名称可以点击。若是你按照上篇文章中的教程，将出现点击搜索结果后无反应的情况。  
有感兴趣的，可以自行探索，我将可用的正确规则贴在下面：
```
akianime
1.3
https://www.akianime.cc/
https://www.akianime.cc/bgmsearch/-------------.html?wd=@keyword
//div[@class='vod-detail style-detail cor4 search-list']
//div/div[2]/a/h3
//div/div[2]/div[5]/div[1]/a   
//ul[@class='anthology-list-play size']
//li/a
```

其特殊之处就在于，第5行的语法只能像这样写，否则就读取不到搜索结果。  
另外第7行语法对应的是播放界面，因为如果按照常规的写法，会出现上述提到的情况，即点击搜索结果后无反应  
为了研究学习，我将其“错误”写法也放在下面，此写法则是完全按照上篇教程中所说的进行编写，所以特殊情况还需要特殊对待：
```
错误
1
https://www.akianime.cc/
https://www.akianime.cc/bgmsearch/-------------.html?wd=@keyword
//div[5]/div//div
//div/div[2]/a/h3
//div/div[2]/a/h3
//div[7]/div[2]/div[2]//div
//div/ul/li/a
```

当然，不是所有的网站的结构都很清晰完整，可以让你轻松找到对应Xpath，  
比如网站：https://anime1.me/ 其HTML结构非常特殊，有想挑战的可以试试







