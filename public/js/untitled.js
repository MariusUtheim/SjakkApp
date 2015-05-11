
	var types = {
		'Normal': "&nbsp;",
		'Kampanje': "Uke",
		'Replenish': "Replenishment",
		'Alle': "",
		'Ship2Store': "Ship2Store",
		'Reservert': "Reservert",
		'Utstilling': "Utstilling"
	}

	var categories = {
		'Alle': -1,
		'Udefinert': 0,
		'Hvitevarer': 1,
		'Lyd & bilde': 2,
		'Småvarer': 3,
		'Tele': 4,
		'Data': 5,
		'Kjøkken': 6
	}

	$("input[type='button'].select, input[type='button'].sort").click(function() {

		$(this).siblings().removeClass('active')
		$(this).addClass('active')

		type = types[$("input[type='button'].sort.active").val()]
		category = categories[$("input[type='button'].select.active").val()]

		$(".tablerows").each(function() {
			var cat = $(this).find('td:nth-child(4) select').val()
			var typ = $(this).find('td:nth-child(6)').html()
			if ((category==-1 || cat == category) && typ.indexOf(type)!=-1) { 
				$(this).show()
			} else {
				$(this).hide()
			}
		})
	})
