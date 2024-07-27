var counter1=0;
    var counter2=0;
    var counter3=0;

    function agree_counter(num){        
        if (num==1) { counter1=1; var deac = document.getElementById('agree1'); var ac = document.getElementById('disagree1');
        } else if (num==2) {counter2=1; var deac = document.getElementById('agree2'); var ac = document.getElementById('disagree2');
        } else if (num==3) {counter3=1; var deac = document.getElementById('agree3'); var ac = document.getElementById('disagree3');
        }
        deac.setAttribute('disabled','disabled');
        if (ac.hasAttribute('disabled')){ ac.removeAttribute('disabled') }
        if (counter1==1 && counter2==1 && counter3==1){
            var B = document.getElementById('last_btn');
            B.removeAttribute('disabled')
        }        
    }
    function disagree_counter(num){
        if (num==1) { counter1=-1; var deac = document.getElementById('disagree1'); var ac = document.getElementById('agree1');
        } else if (num==2) { counter2=-1; var deac = document.getElementById('disagree2'); var ac = document.getElementById('agree2');
        } else if (num==3) { counter3=-1; var deac = document.getElementById('disagree3'); var ac = document.getElementById('agree3');
        }
        deac.setAttribute('disabled','disabled');
        if (ac.hasAttribute('disabled')){ ac.removeAttribute('disabled') }    
        var B = document.getElementById('last_btn');
        if ( !(B.hasAttribute('disabled')) ){
            B.setAttribute('disabled','disabled')
        }
    }