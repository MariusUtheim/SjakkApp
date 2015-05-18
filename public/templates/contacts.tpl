
	    <div class="container">
	        	{{#if player}}
		    	<h3>Other players</h3>
				<table class="table">
				    <thead>
				        <tr>
				            <th>Username</th>
				            <th></th>
				        </tr>
				    </thead>
					<tbody>
				    	{{#each player}}
				    	<tr data-id="{{{id}}}" data-username={{attributes.username}}>
				    		<td>{{{attributes.nickname}}}</td>
				    		<td><button class="btn btn-default" id="cmdPlayOpponent">Play</button></td>
				        </tr>
				    	{{/each}}
	    			</tbody>
    			</table>
    			{{else}}
	  			<div class="spinner">
					<div class="bounce1"></div>
					<div class="bounce2"></div>
					<div class="bounce3"></div>
				</div>
    			{{/if}}	    	
		</div>