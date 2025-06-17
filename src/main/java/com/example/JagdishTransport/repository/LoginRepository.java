package com.example.JagdishTransport.repository;

import com.example.JagdishTransport.model.Login;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LoginRepository extends JpaRepository<Login, Long> {
	
	  Optional<Login> findByUsername(String username);
	 
	Optional<Login> findTopByUsernameOrderByIdDesc(String username);

}
