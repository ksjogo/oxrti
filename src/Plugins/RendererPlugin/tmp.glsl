     /*    vec3 lightTemp;
			vec3 halfAngleTemp;
			vec3 tPrime;
			vec3 bPrime;
		
			vec3 eyeDir = vec3(0,0,-1);

			// calc projection of lightTemp into texture coords
			lightTemp = normalize(lightPos - fragPosition);
			
			halfAngleTemp = normalize(eyeDir + lightTemp);
			
			tPrime = fragTangent - (halfAngleTemp * dot(fragTangent, halfAngleTemp));
			tPrime = normalize(tPrime);
			
			bPrime = cross(halfAngleTemp, tPrime);

			float Lu = dot(lightTemp, tPrime);
			float Lv = dot(lightTemp, bPrime);