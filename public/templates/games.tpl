
	    <div class="container">
		    	<h3>Active games</h3>	        
	        	{{#if game}}
				<table class="table">
				    <thead>
				        <tr>
				            <th>Opponent</th>
				            <th>Color</th>
				            <th>Moves</th>
				            <th>State</th>
				            <th class="visible-md-inline-block visible-lg-inline-block">Started</th>
				        </tr>
				    </thead>
					<tbody>
				    	{{#each game}}
				    	<tr data-id="{{{objectId}}}" {{#if isItMyTurn}}class="success"{{/if}}>
				    		<td><a class="game" href="">{{Opponent.nickname}}</a></td>
				    		<td>{{Color}}</td>
				    		<td>{{Moves}}</td>
				    		<td>{{State}}</td>
				        	<td class="visible-md-inline-block visible-lg-inline-block">{{{createdAt}}}</td>
				        </tr>
				    	{{/each}}
	    			</tbody>
    			</table>
    			{{else}}
    			<h3>There are no active games.</h3>
    			{{/if}}
	    </div>