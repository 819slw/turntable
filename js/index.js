$(function(){	
	//初始化扇形
	var bk=['#FFF6C5','#ffe59c',"#FFCC73"];
	var color=['#B0612F','#B0612F','#B0612F'];
	var index=0;
	var number=[],Sector_word=[],Sector_bk=[],images=[],font_cl=[],id=[];
	for(var k=0;k<configs.items.length;k++){
		number.push(1);	
		id.push(configs.items[k].id);	
		images.push(configs.items[k].img);
		Sector_word.push(configs.items[k].title);
		if(index == 3){
			index=0;
		}
		if(k == configs.items.length-1 && configs.items.length != 3){
			index=1;
		}
		Sector_bk.push(bk[index]);
		font_cl.push(color[index]);
		index++;
	}
	
	//初始化页面
	init(number,Sector_bk,Sector_word,id,images,font_cl);

	//屏幕大小改变时
	$(window).resize(function(){
		init(number,Sector_bk,Sector_word,id,images,font_cl);
	});
	
	// 结束时间的倒计时
	start_time();
	
	//触发转盘
	$.mockjax({
	  	url: "test1",
//	  	status:404,
	  	responseText: {
			"code":1,"msg":"音响","data":{"times":3,"img":"images/turntable_click.png"}
		}
	});
	
	$('.turntable_click').click(function(event){
		falseSlide();
		var timesNum=$('.times_num').html();
		if(timesNum < 1){  //次数用完
					$('.result').attr('src','images/fail_result.png');
					$('.eject_aquire').hide();
					$('.result')[0].onload=function(){
						$('.congratulate').html('很遗憾！次数已用完');
						show_drap();
						configs.flag=true;
					}
		}else{					//请求数据
			if(configs.flag){
				configs.flag=false;
				startPlay();
			}
		}
	});
	
	$('.determine').click(function(){  //点击前往我的奖品之前关闭当前页面的动作
		hide_drap();
	});
	
	$('#close').click(function(){    //关闭弹出窗
		hide_drap();
		trueSlide();
		$(window).css('overflow','auto');
	});
	
	$('.again_eject').click(function(){  //再抽一次按钮
		$('.eject_box ').hide();
		$('.drag').hide();
		startPlay();
	});
});

function init(number,Sector_bk,Sector_word,id,images,font_cl){
	var cx=$('.turntable_Prize').width()/2;
	$('.turntable_Prize').children().remove();
	$('.turntable_Prize').append(
		pieChart(number,'100%','100%',cx,cx,cx,Sector_bk,Sector_word,0,0,id,images,font_cl)
	);
}



function times_end(){
	$('.congratulate').html('很遗憾！次数已用完');
	$('.again_eject').hide();
	$('.eject_pic').hide();
	$('.eject_aquire').hide();
	$('.eject_box').show();
	$('.drag').show();
	$('.result').attr('src','images/fail_result.png');
	$('.turntable_Prize').removeClass('add_transition');
	configs.flag=true;
}

//ajax请求数据
function startPlay(){
	$('body').css('overflow','hidden');
	var oldDeg=0;
		$.ajax({
			url:"test1",
            async:true,
			success:function(data){
				var	name=data.msg;
				var	img=data.data.img;
				if(data.code == 1){
					var	id=data.data.id;
					var path_length=$('.grid_turntable path').length;   //获取扇形总个数
					var single_deg=360/path_length;							//每个扇形的平均角度
					var random_deg=Math.round(Math.random()*single_deg);	//在平均角度中任意去一个角度
					var times_val=data.data.times;
					if(id == undefined){
						$('.result').attr('src','images/fail_result.png');
						$('.congratulate').html('很遗憾！没有中奖');
						$('.eject_pic').hide();
						$('.eject_aquire').hide();
						$('.again_eject').show();
						var now_deg=$('.turntable_Prize').css('transform');
						$('.turntable_Prize').addClass('add_transition').css('transform','rotate('+(360*configs.deg_times+random_deg+oldDeg)+'deg)');   
						setTimeout(function(){
							$('.times .times_num').html(times_val);
							show_drap(name,img);
							$('.turntable_Prize').removeClass('add_transition');
							oldDeg=360-getmatrix();
							configs.flag=true;
						},4010);
					}else{
						var index;
						$('.congratulate').html('恭喜您!');
						$('.eject_pic').show();
						$('.result').attr('src','images/result.png');
						$('.again_eject').hide();
						for(var i=0;i<path_length;i++ ){     //获取 这个id对应的是 哪一个扇形
							var index_id=$('.grid_turntable path').eq(i).attr('id');
							if(index_id == id){
								index = i;
								break;
							}
						}
						var now_deg=$('.turntable_Prize').css('transform');
						$('.turntable_Prize').addClass('add_transition').css('transform','rotate('+(360*configs.deg_times-single_deg*index-random_deg+oldDeg)+'deg)');   
						setTimeout(function(){
							$('.times .times_num').html(times_val);
							show_drap(name,img);
							configs.flag=true;
							$('.turntable_Prize').removeClass('add_transition');
							oldDeg=360-getmatrix();
						},4010);
					}
				}else{
					$('.result').attr('src','images/fail_result.png');
					$('.eject_aquire').hide();
					$('.result')[0].onload=function(){
					$('.congratulate').html('很遗憾！活动结束');
					show_drap();
					configs.flag=true;
					}
				}
			},
			error:function(){	
					$('.result').attr('src','images/fail_result.png');
					$('.eject_aquire').hide();
					$('.result')[0].onload=function(){
					$('.congratulate').html('很遗憾！网络短路');
					show_drap();
					configs.flag=true;
					}
			}
		});
		configs.deg_times += 10;
}

//	获取转盘角度
function getmatrix(){
	oldDeg=$('.turntable_Prize').css('transform');
	var values = oldDeg.split('(')[1].split(')')[0].split(',');
	var a = values[0];
	var b = values[1];
	var c = values[2];
	var d = values[3];
    var aa=Math.round(180*Math.asin(a)/ Math.PI);
    var bb=Math.round(180*Math.acos(b)/ Math.PI);
    var cc=Math.round(180*Math.asin(c)/ Math.PI);
    var dd=Math.round(180*Math.acos(d)/ Math.PI);
    var deg=0;
    if(aa==bb||-aa==bb){
        deg=dd;
    }else if(-aa+bb==180){
        deg=180+cc;
    }else if(aa+bb==180){
        deg=360-cc||360-dd;
    }
    return deg>=360?0:deg;
}
function falseSlide(){
	$(document).on('touchmove',function (e){
	    e.preventDefault();
	});
}

function trueSlide(){
	$(document).unbind();
}
//获取滚动条的高度
function show_drap(name,img){
	var top=$(document).scrollTop();
	var bodyHeight=$('body').height();
	falseSlide();
	var height=$(window).height();
	var size=$('.eject_box').width();
	var ejectHeight=$('.eject_box').height();
	var ejectTop=(height-ejectHeight)/2+top;
	$('.drag').css('height', bodyHeight).show();
	
	
	$('.eject_box').css('top',ejectTop).css('left','8%').css('width',size).show().css('opacity',0).animate({
		'opacity':1
	},200);
	$('.eject_pic').attr('src',img);
	$('.eject_name').html(name);

}

//隐藏遮罩
function hide_drap(){
	$('body').css('overflow','auto');
	$('.drag').hide();
	$('.eject_box').hide();
}	

//时间刷新
function start_time(){
	setTimeout(function(){
			show_time();
	},1000);
}

//时间倒计时
function show_time(){   	
    var time_distance =configs.end_time -- ;  	
    // 天
    var int_day = Math.floor(time_distance/86400) 
    time_distance -= int_day * 86400; 
    // 时
    var int_hour = Math.floor(time_distance/3600) 
    time_distance -= int_hour * 3600; 
    // 分
    var int_minute = Math.floor(time_distance/60) 
    time_distance -= int_minute * 60; 
    // 秒 
    var int_second = Math.floor(time_distance) 
    // 时分秒为单数时、前面加零 
    if(int_day < 10 && int_day != 0){ 
        int_day = "0" + int_day; 
    } 
    if(int_hour < 10  && int_hour != 0){ 
        int_hour = "0" + int_hour; 
    } 
    if(int_minute < 10){ 
        int_minute = "0" + int_minute; 
    } 
    if(int_second < 10){
        int_second = "0" + int_second; 
    } 
    // 显示时间 
    $('.day b').html(int_day);
    $('.hour b').html(int_hour);
    $('.minute b').html(int_minute);
    $('.second b').html(int_second);
    start_time();
}


// 移动端设置
function pieChart(data,width,height,cx,cy,r,colors,labels,lx,ly,id,images,font_cl){
	
	        //这个表示svg元素的xml命名空间
    var svgns="http://www.w3.org/2000/svg";
    var deg=(360/data.length)/2;
    //创建一个<svg>元素，同时指定像素大小和用户坐标
    var chart=document.createElementNS(svgns,"svgs:svg");
    chart.setAttribute("width",width);
    chart.setAttribute("height",height);
    chart.setAttribute("id",'svg');

    //累加data值，以便于知道饼状图的大小
    var total=0;
    for(var i=0;i<data.length;i++){
        total+=data[i];
    }
    //现在计算出饼状图每个分片的大小，其中角度以弧度制计算
    var angles=[];
    for(var i=0;i<data.length;i++){
        angles[i]=data[i]/total*Math.PI*2;
	}
    //遍历病状图的每个分片
    starttangle=0;
    for(var i=0;i<data.length;i++){
    	 var g=document.createElementNS(svgns,"g");
        //这里表示楔的结束为止
        var endangle=starttangle+angles[i];

        //计算出楔和园橡胶的两个点
        //这些计算公式都是以12点钟方向为0°
        //顺时针方向角度递增
        var x1=cx+r*Math.sin(starttangle);
        var y1=cy-r*Math.cos(starttangle);
        var x2=cx+r*Math.sin(endangle);
        var y2=cy-r*Math.cos(endangle);

        //这个标记表示角度大于半圆
        //此标记在绘制SBG弧形组件的时候需要
        var big=0;
        if(endangle-starttangle>Math.PI) big=1;

        //使用<svg:path>元素来描述楔
        //要注意的是，使用ctreateElementNS()来创建该元素
        var path=document.createElementNS(svgns,"path");

        //下面的字符串包含路径的详细信息
        var d="M "+cx+","+cy+ //从圆心开始
            " L "+x1+","+y1+   //画一条到(x1,y1)的线段
            " A "+r+","+r+     //再画一条半径为r的弧
            " 0 "+big+" 1 "+    // 弧的详细信息
            x2+","+y2+    //弧到(x2,y2)结束
            "Z";   //d当前路径到(cx,cy)结束

        path.setAttribute("d",d);   //设置路径
        path.setAttribute("fill",colors[i]); //设置楔的颜色
        path.setAttribute("id",id[i]);
		g.appendChild(path);
        //当前楔的结束就是下一个楔的开始
        starttangle=endangle;
        
        var average=data.length/2;
        //在小方块的右边添加标签
        var label=document.createElementNS(svgns,"text");
        var t_left=(x1+x2)/2;
        var t_top=(y1+y2)/2;
        label.setAttribute("x",t_left);
    	label.setAttribute("y",t_top);
        label.setAttribute("font-family","sans-serif");
        label.setAttribute("font-size","0.25rem");
        label.setAttribute("fill",font_cl[i]);
        label.appendChild(document.createTextNode(labels[i]));

        switch(data.length)
			{
			case 2:
        	label.setAttribute("transform","rotate("+ deg +", "+ t_left +", "+ t_top +") translate(0,-100)");
			  break;
			case 3:
        	label.setAttribute("transform","rotate("+ deg +", "+ t_left +", "+ t_top +") translate(0,-35)");
			  break;
			  case 4:
			label.setAttribute("transform","rotate("+ deg +", "+ t_left +", "+ t_top +")  translate(0,0)");
			  break;
			default:
			label.setAttribute("transform","rotate("+ deg +", "+ t_left +", "+ t_top +")  translate(0,18)");
			}
        g.appendChild(label); //将文本添加到饼状图
        
        var image=document.createElementNS('http://www.w3.org/2000/svg','image');
        var i_left=(x1+x2)/2;
        var i_top=(y1+y2)/2;
    	image.setAttribute("x",i_left);
    	image.setAttribute("y",i_top);
    	
        image.setAttribute("width","30px");
        image.setAttribute("height","30px");
        image.setAttributeNS('http://www.w3.org/1999/xlink','href', images[i]);
        image.setAttribute('class', 'image');
        switch(data.length)
			{
			case 2:
        	image.setAttribute("transform","rotate("+ deg +", "+ i_left +", "+ i_top +") translate(-15,-90)");
			  break;
			case 3:
        	image.setAttribute("transform","rotate("+ deg +", "+ i_left +", "+ i_top +") translate(-15,-15)");
			  break;
			  case 4:
			image.setAttribute("transform","rotate("+ deg +", "+ i_left +", "+ i_top +") translate(-15,10)");
			  break;
			default:
			image.setAttribute("transform","rotate("+ deg +", "+ i_left +", "+ i_top +") translate(-15,30)");
			}
        g.appendChild(image); //将文本添加到饼状图          
        deg += 360/data.length; 
        chart.appendChild(g);
    }
	return chart;
}


