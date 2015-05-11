
		<nav class="navbar navbar-default">
		 	<div class="container-fluid">

		    	<div class="navbar-header">
		      		<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
		        		<span class="icon-bar"></span>
		        		<span class="icon-bar"></span>
		        		<span class="icon-bar"></span>
		      		</button>
		     		<a class="navbar-brand" href="#" id="cmdLogo">Sjakkapp</a>
		    	</div>

			    <div class="collapse navbar-collapse" id="myNavbar">

			    	<ul class="nav navbar-nav">
			        	<li class="active"><a id="cmdGames" href="#">Games</a></li>
				    	<li><a id="cmdContacts" href="#">Contacts</a></li>
				    	<li><a id="cmdSettings" href="#">Settings</a></li>        
			      	</ul>

			      	<ul class="nav navbar-nav navbar-right">
				        <li class="dropdown">
				        	<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">{{user.nickname}}<span class="caret"></span></a>
				            <ul class="dropdown-menu" role="menu">
				                <li><a href="#" id="cmdProfile"><span class="glyphicon glyphicon-user"></span> Profile</a></li>
				                <li class="divider"></li>
				                <li><a href="#" id="cmdLogout"><span class="glyphicon glyphicon-log-out"></span> Log out</a></li>
				            </ul>
				        </li>
			      	</ul>

		    	</div>
			</div>
		</nav>